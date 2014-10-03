Meteor.methods({
  addContactable: function (contactable) {
    return ContactableManager.create(contactable);
  },
  createEmployeeFromResume: function(resumeFileId) {
    return ContactableManager.createFromResume(resumeFileId);
  },
  updateContactablePicture: function (contactableId, fileId) {
    ContactableManager.setPicture(contactableId, fileId);
  }
});