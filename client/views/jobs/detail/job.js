JobController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [JobHandler, ObjTypesHandler, GoogleMapsHandler]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action:function(){
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('job')
    },
  onAfterAction: function() {
    var title = 'Jobs / ' + Session.get('jobDisplayName'),
      description = 'Job information';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var getDefinitionFromField=function(field, obj, path){
  var type;
  switch (field.fieldType){
    case 'string':
      type=Utils.ReactivePropertyTypes.string;
      break;
    case 'date':
      type=Utils.ReactivePropertyTypes.date;
      break;
    case 'number':
      type=Utils.ReactivePropertyTypes.int;
      break;
    case 'lookUp':
      type=Utils.ReactivePropertyTypes.lookUp;
      break;

  }

  var result={
    default: obj[field.name],
    update: path+ field.name,
    type: type
  }
  if(type==Utils.ReactivePropertyTypes.lookUp){
    var displayName=obj[field.name+'Name'];
    var lookup=LookUps.findOne({_id: obj[field.name]});
    if (displayName==null && lookup!=null)  displayName= LookUps.findOne({_id: obj[field.name]}).displayName;
    result.displayName=displayName;
    result.options=LookUps.find({codeType: field.lookUpCode, inactive: {$ne: true}}, { sort: {displayName: 1} });
  }
  return result;
}
toReactiveObject=function(addModel, obj){
    var reactiveObj={
        _id: obj._id,
        reactiveProps: {}
    }
    var object=obj;
    var path='';
    var props={};
    _.each(addModel.fieldGroups,function(fieldGroup){
        _.each(fieldGroup.items,function(item){
            if(item.type=='field'){
              props[item.name]=getDefinitionFromField(item, object, path);

            }
        })
    })
    _.each(addModel.subTypes,function(subType){
        path=subType.name + '.';
        object=obj[subType.name];
        _.each(subType.fieldGroups,function(fieldGroup){
            _.each(fieldGroup.items,function(item){
                if(item.type=='field'){
                  props[item.name]=getDefinitionFromField(item, object, path);
                }
            })
        })
    })

    _.extend(reactiveObj.reactiveProps, props);
    return reactiveObj;
}

var generateReactiveObject = function(job) {

  var type=job.objNameArray[1-job.objNameArray.indexOf('job')];
  var definition= toReactiveObject(dType.objTypeInstance(type), job);
  definition.reactiveProps.tags={
    default: job.tags,
    update: 'tags',
    type: Utils.ReactivePropertyTypes.array
  }
  definition.reactiveProps.location={
    default: job.location,
    update: 'location'
  }
  return new Utils.ObjectDefinition(definition);
};



var self={};
Utils.reactiveProp(self, 'editMode', false);

Template.job.created=function(){
  self.editMode=false;
}

Template.job.helpers({
    job: function(){
      var originalJob=Jobs.findOne({ _id: Session.get('entityId') });
      Session.set('jobDisplayName', originalJob.displayName);
      job = generateReactiveObject(originalJob);
        console.log(job);
      return job;
    },
    originalJob:function(){
      return Jobs.findOne({ _id: Session.get('entityId') });
    },
    editMode:function(){
        return self.editMode;
    },
    colorEdit:function(){
        return self.editMode ? '#008DFC' : '#ddd'
    },
    isType:function(typeName){
      return !! Jobs.findOne({ _id: Session.get('entityId'), objNameArray: typeName});
    },
    jobCollection: function(){
      return Jobs;
    },
    getCustomer:function(){
      var j=Jobs.findOne({ _id: Session.get('entityId')});
      return j && j.customer;
    },
    noteCount: function() {
        return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }}).count();
    },
 isSelected:function(optionValue, currentValue){
      return optionValue == currentValue;
    }

})
Template.job.events({
    'click .editJob':function(){
        self.editMode= ! self.editMode;
    },
    'click .saveButton':function(){

      if (!job.isValid()) {
          job.showErrors();
          return;
      }
      console.dir(job.generateUpdate())
      Jobs.update({_id: job._id}, job.generateUpdate(), function(err, result) {
          if (!err) {
              self.editMode=false;
              job.updateDefaults();
          }
      });
    },
    'click .cancelButton':function(){
        self.editMode=false;
    },
    'click .see-less':function(){
      $('.job-description').removeClass('in')
    },
    'click .see-more':function(){
      $('.job-description').addClass('in')
    },
    'click .job-description':function(e){
      if (!$(e.target).hasClass('see-less')){
        $('.job-description').addClass('in')
      }
    },
    'click .add-tag': function() {
      addTag();
    },
    'keypress #new-tag': function(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        addTag();
      }
    },
    'click .remove-tag': function() {
      job.tags.remove(this.value);
    }
})


var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(job.tags.value, inputTag.value) != -1)
    return;
  job.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};
Template.jobDescription.rendered=function(){
  var description=$('.job-description');
  var container=description.find('.htmlContainer');
  if(container.height()<=100){
    description.addClass('none')
  }


  container.on('resize', _.debounce(function(){
    if(container.height()<=100){
      description.addClass('none')
    }else{
      description.removeClass('none')
    }
  },200));

}
Template.job_tabs.helpers({
  getType: function(){
    return Enums.linkTypes.job;
  }
})