var note;
var Error={};


//todo: the logic for the linked entities is almost the same in Tasks and Note. We should do some template to use it in both places.
var typeDep= new Deps.Dependency();
var linkedDep= new Deps.Dependency();
var link=function(link){
  if (_.findWhere(note.links,{
    id: link.id
  }))
    return;

  note.links.push(link);
}
var noteDep=new Deps.Dependency;
var errorDep=new Deps.Dependency;
var createNote=function(note){

  var note=note || {};

  var definition = {
    msg: note.msg,
    links: note.links || []
//    reactiveProps: {}
  };
  if(note._id)
    definition._id= note._id;
  return definition;
//  return new Utils.ObjectDefinition(definition);
};

Template.addEditNote.helpers({
  isEditing: function(){
    return !! note._id;
  },
  note:function(){
    if(!note){
      var param={};
      if(this){
        param=this[0]
      }
      note=createNote(param);
    }
    noteDep.depend();
    return note;
  },
  users :function(){
    return Meteor.users.find({});
  },
  isSelected:function(){
    return true;
  },
  error: function(){
    errorDep.depend()
    return Error;
  },
  hasError:function(key){
    errorDep.depend();
    return Error[key] ? 'error': '';
  },

  types: function(){
    return _.map( _.filter(_.keys(Enums.linkTypes), function(key){
      return !_.contains(['deal', 'candidate'], key);
    }),function(key){
        return Enums.linkTypes[key];
    });
  },
  entities:function(){
    typeDep.depend();
    var selectedType= $('#noteTypeSelect').val();
    selectedType=parseInt(selectedType);
    switch (selectedType){
      case Enums.linkTypes.contactable.value:
        return AllContactables.find();
      case Enums.linkTypes.job.value:
        return AllJobs.find();
     case Enums.linkTypes.placement.value:
        return AllPlacements.find();
      default :
        return [];
    }
  },
  linkedEntities: function(){
    linkedDep.depend();
    return note.links;
  },
  getEntity: Utils.getEntityFromLinkForAdd
});
var isValid= function(note, key){
  var result= true;

  if (key){
    if (key=='msg'){
      if (!note.msg){
        Error.msg='This field is required';
        result=false;
      }else{
        Error.msg='';
      }
    }

  }
  else{
    if (!note.msg){
      Error.msg='This field is required';
      result=false;
    }else{
      Error.msg='';
    }


  }
  errorDep.changed();
  return result;
}
Template.addEditNote.events({
  'click .accept':function(){
    if (!isValid(note)) {
      return;
    }

    if (note._id){
      Notes.update({
        _id: note._id
      }, {
        $set: {
          msg: note.msg,
          links: note.links
        }
      },function(){
        $('.modal-host').children().modal('toggle')
      })
    } else {
      Notes.insert(note,function(){
        $('.modal-host').children().modal('toggle')
      })
    }
  },
  'click .archive': function () {
    if (!isValid(note)) {
      return;
    }
    if (note._id){
      Notes.update({
        _id: note._id
      }, {
        $set: {
          msg: note.msg,
          links: note.links
        }
      },function(){
        $('.modal-host').children().modal('toggle')
      })
    } else {
      Notes.insert(note,function(){
        $('.modal-host').children().modal('toggle')
      })
    }
  },
  'change.dp .completed>.dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      note.completed = $(e.target).data('DateTimePicker').date.toDate();
    }
  },
  'change.dp .begin>.dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      note.begin = $(e.target).data('DateTimePicker').date.toDate();
    }
  },
  'change.dp .end>.dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      note.end = $(e.target).data('DateTimePicker').date.toDate();
    }
  },
  'change .isCompleted': function(e){
    if(e.target.checked){
      note.completed=new Date;
    }else{
      note.completed=null;
    }
    noteDep.changed();
  },
  'change .msg':function(e){
    note.msg= e.target.value;
  },
  'change .assign': function(e){
    note.assign=$(e.target).val()
  },
  'blur .msg': function(){
    isValid(note, 'msg');
  },
  'blur .assign': function(){
    isValid(note, 'assign');
  },

  'change #noteTypeSelect': function(){
    typeDep.changed();
  },
  'click #noteLinkEntity':function(){
    var type= $('#noteTypeSelect').val();
    type= parseInt(type);
    var entity= $('#noteEntitySelect').val();
    if (!_.isNumber(type) || ! entity) return;

    link({
      type: type,
      id: entity
    });
    linkedDep.changed();
  },
  'click .remove-link': function(){
    var item=_(note.links).findWhere({id:this._id})

    note.links= _(note.links).without(item);
    linkedDep.changed();
  }

})

Template.addEditNote.created=function(){
  Meteor.subscribe('allContactables');
  Meteor.subscribe('allJobs');
  Meteor.subscribe('allPlacements');
  note=null;
}