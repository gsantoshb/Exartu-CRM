ContactableManager = {
  create: function (contactable) {
    return Contactables.insert(contactable);
  },
  createFromResume: function (stream) {
    var result = ResumeManager.parse(stream);
    if (result instanceof Meteor.Error)
      throw result;

    return ContactableManager.create(result);
  },
  setPicture: function (contactableId, fileId) {
    Contactables.update({
      _id: contactableId
    }, {
      $set: {
        pictureFileId: fileId
      }
    });
  }
};