JobController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function(){
        return [JobHandler, ObjTypesHandler]
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
    }

});


var job = {};

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
                var type;
                switch (item.fieldType){
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
                props[item.name]={
                  default: object[item.name],
                  update: path+ item.name,
                  type: type
                }
                if(type==Utils.ReactivePropertyTypes.lookUp){
                  props[item.name].displayName=obj[item.name+'Name'];
                  props[item.name].options=LookUps.find({codeType: item.lookUpCode});
                }
            }
        })
    })
    _.each(addModel.subTypes,function(subType){
        path=subType.name + '.';
        object=obj[subType.name];
        _.each(subType.fieldGroups,function(fieldGroup){
            _.each(fieldGroup.items,function(item){
                if(item.type=='field'){
                    var type;
                    switch (item.fieldType){
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
                    props[item.name]={
                        default: object[item.name],
                        update: path+ item.name,
                        type: type
                    }
                }
            })
        })
    })

    _.extend(reactiveObj.reactiveProps, props);
    return reactiveObj;
}

var generateReactiveObject = function(job) {
//    var definition = {
//        _id: job._id,
//        reactiveProps: {}
//    };

//    _.extend(definition.reactiveProps, {
//
//        startDate: {
//            default: job.startDate,
//            update: 'startDate',
//            type: Utils.ReactivePropertyTypes.date
//        },
//        endDate: {
//            default: job.endDate,
//            update: 'endDate',
//            type: Utils.ReactivePropertyTypes.date
//        },
//        duration: {
//            default: job.duration,
//            update: 'duration',
//            type: Utils.ReactivePropertyTypes.lookUp
//
//        },
//        status: {
//            default: job.status,
//            update: 'status',
//            type: Utils.ReactivePropertyTypes.lookUp
//        },
//        industry: {
//            default: job.industry,
//            update: 'industry',
//            type: Utils.ReactivePropertyTypes.lookUp
//        },
//        category: {
//            default: job.category,
//            update: 'category',
//            type: Utils.ReactivePropertyTypes.lookUp
//        }
//    });


//    var updateBase = '';

    // Customer
//    if (contactable.Customer){
//        updateBase = 'Customer.';
//        var customer = contactable.Customer;
//        _.extend(definition.reactiveProps, {
//            customer: {
//                default: true
//            },
//            department: {
//                default: customer.department,
//                update: updateBase + 'department'
//            },
//            description: {
//                default: customer.description,
//                update: updateBase + 'description'
//            }
//        });
//    }


//    return new Utils.ObjectDefinition(definition);
  var type=job.objNameArray[1-job.objNameArray.indexOf('job')];
  var definition= toReactiveObject(dType.objTypeInstance(type), job);
  definition.reactiveProps.tags={
    default: job.tags,
    update: 'tags',
    type: Utils.ReactivePropertyTypes.array
  }
  return new Utils.ObjectDefinition(definition);
};



var self={};
Utils.reactiveProp(self, 'editMode', false);

Template.job.helpers({
    job: function(){
        job = generateReactiveObject(Jobs.findOne({ _id: Session.get('entityId') }));
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
    collapsed: function(){
      return this.value.length <= 1000 ? 'none': '';
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
    }
})


Template.job.asd = function () {

    self.newTag = ko.observable();
    self.addTag = function () {
        if (!self.newTag()) {
            return;
        }
        self.editJob().tags.push(self.newTag());
        self.newTag('');

    };
    self.removeTag = function (data) {
        self.editJob().tags.remove(data);
    };
    self.editTag = ko.observable();

    return self;
};