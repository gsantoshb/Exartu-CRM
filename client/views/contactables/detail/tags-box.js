var contactable = {};

Template.contactableTagsBox.tags = function() {
  contactable = new Utils.ObjectDefinition({
    reactiveProps: {
      tags: {
        type: Utils.ReactivePropertyTypes.array,
        default: this.tags,
        cb: {
          onInsert: function(newValue) {
            Contactables.update({ _id: this._id}, {$addToSet: {tags: newValue}});
          },
          onRemove: function(value) {
            Contactables.update({ _id: this._id}, {$pull: {tags: value}});
          }
        }
      }
    }
  });
  return contactable.tags;
};

Template.contactableTagsBox.hasTags = function() {
  return _.isArray(this.tags);
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
};
