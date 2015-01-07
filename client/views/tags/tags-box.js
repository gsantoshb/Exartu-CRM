var objdef = {};
var self={};
var coll=null;
Utils.reactiveProp(self, 'editMode', false);

Template.tagsBox.created=function(){
  self.editMode=false;
};

Template.tagsBox.helpers({
  tags: function () {
    coll = Utils.getCollectionFromEntity(this);
    if (!_.isArray(this.tags)) this.tags = [];
    objdef = new Utils.ObjectDefinition({

      reactiveProps: {
        tags: {
          type: Utils.ReactivePropertyTypes.array,
          default: this.tags,
          cb: {
            onInsert: function (newValue) {
              coll.update({_id: objdef._id}, {$addToSet: {tags: newValue}});
              GAnalytics.event("/objdef", "tags", "add");
            },
            onRemove: function (value) {
              coll.update({_id: objdef._id}, {$pull: {tags: value}});
            }
          }
        }
      },
      _id: this._id
    });
    return objdef.tags;
  },

  editMode: function () {
    return self.editMode;
  },

  editModeColor: function () {
    return self.editMode ? '#008DFC' : '';
  },

  hasTags: function () {
    return _.isArray(this.tags);
  },

  isEmptyTags: function () {
    return _.isEmpty(objdef.tags.value);
  }
});

Template.tagsBox.events = {
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
    objdef.tags.remove(this.value);
  },
  'click .focusAddTag': function(){
    $('#new-tag')[0].focus();
  },
  'click .editTags': function(){
    self.editMode = ! self.editMode;
  }
};

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(objdef.tags.value, inputTag.value) != -1)
    return;

  objdef.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
}