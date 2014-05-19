var contactable = {};
var hasTags = true;

Template.contactableTagsBox.created = function() {
  var self = this;
  if (!_.isArray(self.data.tags)) {
    debugger;
    hasTags = false;
  }
  else
    contactable = Utils.ObjectDefinition({
      reactiveProps: {
        tags: {
          type: Utils.ReactivePropertyTypes.array,
          default: this.data.tags,
          cb: {
            onInsert: function(newValue) {
              Contactables.update({ _id: self.data._id}, {$addToSet: {tags: newValue}});
            },
            onRemove: function(value) {
              Contactables.update({ _id: self.data._id}, {$pull: {tags: value}});
            }
          }
        }
      }
    });
}

Template.contactableTagsBox.tags = function() {
  return contactable.tags;
};

Template.contactableTagsBox.hasTags = function() {
  return hasTags;
};

Template.contactableTagsBox.events = {
  'click .add-tag': function() {
    var inputTag = $('#new-tag')[0];

    if (!inputTag.value)
      return;

    if (_.indexOf(contactable.tags.value, inputTag.value) != -1)
      return;

    contactable.tags.insert(inputTag.value);
    inputTag.value = '';
    inputTag.focus();
  },
  'click .remove-tag': function() {
    contactable.tags.remove(this.value);
  }
}
