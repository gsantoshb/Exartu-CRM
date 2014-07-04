var task;
var Error={};
var typeDep= new Deps.Dependency();
var linkedDep= new Deps.Dependency();
var link=function(link){
  if (_.findWhere(task.links,{
    id: link.id
  }))
    return;

  task.links.push(link);
}
var taskDep=new Deps.Dependency;
var errorDep=new Deps.Dependency;
var createTask=function(task){

  var task=task || {};

  var definition = {
    begin: task.begin || new Date(),
    end: task.end || null,
    assign: task.assign || [Meteor.userId()],
    note: task.note,
    completed: task.completed,
    inactive: task.inactive,
    links: task.links || []
//    reactiveProps: {}
  };
  if(task._id)
    definition._id= task._id;
  return definition;
//  return new Utils.ObjectDefinition(definition);
}
Template.addEditTask.helpers({
  isEditing: function(){
    return !! task._id;
  },
  task:function(){
    if(!task){
      var param={};
      if(this){
        param=this[0]
      }
      task=createTask(param);
    }
    taskDep.depend();
    return task;
  },
  users :function(){
    return Meteor.users.find({});
  },
  isSelected:function(){
    return _.contains(task.assign,this._id);
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
    return _.map(_.keys(Enums.linkTypes),function(key){
      return Enums.linkTypes[key];
    })
  },
  entities:function(){
    typeDep.depend();
    var selectedType= $('#typeSelect').val();
    selectedType=parseInt(selectedType);
    switch (selectedType){
      case Enums.linkTypes.contactable.value:
        return Contactables.find();
      case Enums.linkTypes.job.value:
        return Jobs.find();
      default :
        return [];
    }
  },
  linkedEntities: function(){
    console.log('linkedEntities')
    linkedDep.depend();
    return task.links;
  },
  getEntity: Utils.getEntityFromLink

})
var isValid= function(task, key){
  var result= true;

  if (key){
    if (key=='note'){
      if (!task.note){
        Error.note='This field is required';
        result=false;
      }else{
        Error.note='';
      }
    }
    if (key=='assign'){
      if (!task.assign || !task.assign.length){
        Error.assign='This field is required';
        result=false;
      }else{
        Error.assign='';
      }
    }
  }
  else{
    if (!task.note){
      Error.note='This field is required';
      result=false;
    }else{
      Error.note='';
    }

    if (!task.assign.length){
      Error.assign='This field is required';
      result=false;
    }else{
      Error.assign='';
    }
  }
  errorDep.changed();
  return result;
}
Template.addEditTask.events({
  'click .accept':function(){
    if (!isValid(task)) {
      return;
    }

    if (task._id){
      Tasks.update({
        _id: task._id
      }, {
        $set: {
          begin: task.begin,
          end: task.end,
          assign: task.assign,
          note: task.note,
          completed: task.completed,
          links: task.links
        }
      },function(){
        $('.modal-host').children().modal('toggle')
      })
    } else {
      Tasks.insert(task,function(){
        $('.modal-host').children().modal('toggle')
      })
    }
  },
  'click .archive': function () {
    if (!isValid(task)) {
      return;
    }
    if (task._id){
      Tasks.update({
        _id: task._id
      }, {
        $set: {
          inactive: ! task.inactive,
          end: task.end,
          assign: task.assign,
          note: task.note,
          completed: task.completed,
          links: task.links
        }
      },function(){
        $('.modal-host').children().modal('toggle')
      })
    } else {
      Tasks.insert(task,function(){
        $('.modal-host').children().modal('toggle')
      })
    }
  },
  'change.dp .completed>.dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      task.completed = $(e.target).data('DateTimePicker').date.toDate();
    }
  },
  'change.dp .begin>.dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      task.begin = $(e.target).data('DateTimePicker').date.toDate();
    }
  },
  'change.dp .end>.dateTimePicker': function(e, ctx) {
    if ($(e.target).hasClass('dateTimePicker')){
      task.end = $(e.target).data('DateTimePicker').date.toDate();
    }
  },
  'change .isCompleted': function(e){
    if(e.target.checked){
      task.completed=new Date;
    }else{
      task.completed=null;
    }
    taskDep.changed();
  },
  'change .note':function(e){
    task.note= e.target.value;
  },
  'change .assign': function(e){
    task.assign=$(e.target).val()
  },
  'blur .note': function(){
    isValid(task, 'note');
  },
  'blur .assign': function(){
    isValid(task, 'assign');
  },

  'change #typeSelect': function(){
    typeDep.changed();
  },
  'click #linkEntity':function(){
    var type= $('#typeSelect').val();
    type= parseInt(type);
    var entity= $('#entitySelect').val();
    if (!_.isNumber(type) || ! entity) return;

    link({
      type: type,
      id: entity
    });
    linkedDep.changed();
  }

})

Template.addEditTask.created=function(){
  task=null;
}