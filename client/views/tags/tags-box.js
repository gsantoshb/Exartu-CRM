var contactable = {};
var self={};
Utils.reactiveProp(self, 'editMode', false);
Template.tagsBox.created=function(){
  self.editMode=false;
}
Template.tagsBox.tags = function() {
  contactable = new Utils.ObjectDefinition({
    reactiveProps: {
      tags: {
        type: Utils.ReactivePropertyTypes.array,
        default: this.tags,
        cb: {
          onInsert: function(newValue) {
            Contactables.update({ _id: contactable._id}, {$addToSet: {tags: newValue}});
            GAnalytics.event("/contactable", "tags", "add");
          },
          onRemove: function(value) {
            Contactables.update({ _id: contactable._id}, {$pull: {tags: value}});
          }
        }
      }
    },
    _id: this._id
  });
  return contactable.tags;
};

Template.tagsBox.editMode = function() {
  return self.editMode;
};

Template.tagsBox.editModeColor = function() {
  return self.editMode? '#008DFC' : '';
}

Template.tagsBox.hasTags = function() {
  return _.isArray(this.tags);
};

Template.tagsBox.isEmptyTags = function() {
  return _.isEmpty(contactable.tags.value);
};

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(contactable.tags.value, inputTag.value) != -1)
    return;

  contactable.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
}

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
    contactable.tags.remove(this.value);
  },
  'click .focusAddTag': function(){
    $('#new-tag')[0].focus();
  },
  'click .editTags': function(){
    self.editMode = ! self.editMode;
  }
};
