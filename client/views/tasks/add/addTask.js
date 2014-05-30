var task;
var taskDep=new Deps.Dependency;
var createTask=function(task){

  var task=task || {};

  var definition = {
    begin: task.begin || new Date(),
    end: task.end || new Date(),
    assign: task.assign || [],
    note: task.note,
    completed: task.completed
//    reactiveProps: {}
  };
  if(task._id)
    definition._id= task._id;
  return definition;
//  return new Utils.ObjectDefinition(definition);
}
Template.addEditTask.helpers({
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
  }
})

Template.addEditTask.events({
  'click .accept':function(){
    //todo: validation
//    if (!self.task.isValid()) {
//      self.task.errors.showAllMessages();
//      return;
//    }
//

    if (task._id){
      Tasks.update({
        _id: task._id
      }, {
        $set: {
          begin: task.begin,
          end: task.end,
          assign: task.assign,
          note: task.note,
          completed: task.completed
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
  }
})

Template.addEditTask.created=function(){
  task=null;
}