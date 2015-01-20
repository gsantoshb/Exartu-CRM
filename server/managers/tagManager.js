TagManager = {
  apiAddTag: function(tag) {
    // Validation
    if (! tag.contactableId) { throw new Error('Contactable ID is required'); }
    if (! tag.tag || !_.isString(tag.tag) || _.isEmpty(tag.tag)) { throw new Error('Tag must be a non-empty string'); }

    var contactable = Contactables.findOne(tag.contactableId);
    if (!contactable)
      throw new Error('Contactable with id ' + tag.contactableId + 'not found');

    Contactables.update(tag.contactableId, { $addToSet: {tags: tag.tag}});
  },

  apiGetTags: function(contactableId) {
    var contactable = Contactables.findOne({ _id: contactableId});

    return contactable && contactable.tags;
  }
};

