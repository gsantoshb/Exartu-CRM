var note;
var Error={};


//todo: the logic for the linked entities is almost the same in notes and noteAdd. We should do some template to use it in both places.
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
    content: content,
    userId: Meteor.userId(),
    links: note.links || []
//    reactiveProps: {}
  };
  if(note._id)
    definition._id= note._id;
  return definition;
//  return new Utils.ObjectDefinition(definition);
}
Template.addEditNote.helpers({
  types: function(){
    return _.map(_.keys(Enums.linkTypes),function(key){
      return Enums.linkTypes[key];
    })
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
  error: function(){
    errorDep.depend()
    return Error;
  },
  hasError:function(key) {
    errorDep.depend();
    return Error[key] ? 'error' : '';
  },
  entities:function(){
    typeDep.depend();
    var selectedType= $('#noteTypeSelect').val();
    selectedType=parseInt(selectedType);
    switch (selectedType){
      case Enums.linkTypes.contactable.value:
        return Contactables.find();
      case Enums.linkTypes.job.value:
        return Jobs.find();
      default :
        return [];
    }
  }

})
var isValid= function(note, key){
  var result= true;

  if (key){
    if (key=='note'){
      if (!note.note){
        Error.note='This field is required';
        result=false;
      }else{
        Error.note='';
      }
    }
    if (key=='assign'){
      if (!note.assign || !note.assign.length){
        Error.assign='This field is required';
        result=false;
      }else{
        Error.assign='';
      }
    }
  }
  else{
    if (!note.note){
      Error.note='This field is required';
      result=false;
    }else{
      Error.note='';
    }

    if (!note.assign.length){
      Error.assign='This field is required';
      result=false;
    }else{
      Error.assign='';
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

  'change .note':function(e){
    note.note= e.target.value;
  },
  'blur .note': function(){
    isValid(note, 'note');
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
  note=null;
}

var addNote=function (e, ctx) {
  var content=ctx.$('#note-input').val();

  ctx.$('#note-input').val(null);
  if (_.isEmpty(content)) {
    $('#add-note-feedback').text("Please enter a note");
    return;
  }
  Notes.insert({
    content: content,
    links: newNoteLinks,
    userId: Meteor.userId()
  }, function (err, result) {

    newNoteLinks= _.clone(originalLinks);
    linkedDep.changed();
    if (!err) {
      ctx.$('#note-input').val('');
      GAnalytics.event("/contactable", "Add note");
    }
  });
}