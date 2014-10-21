Meteor.methods({
  addContactable: function (contactable) {
    return ContactableManager.create(contactable);
  },
  createEmployeeFromResume: function(stream) {
    return ContactableManager.createFromResume(stream);
  },
  createEmployeeFromPlainText: function(text) {
    this.unblock();
    try {
      return ContactableManager.createFromPlainResume(text);
    } catch (error) {
      throw new Meteor.Error('The text could not be parsed', error);
    }
  },
  updateContactablePicture: function (contactableId, fileId) {
    ContactableManager.setPicture(contactableId, fileId);
  },
  addContactMethod: function (contactableId, type, value) {
    ContactableManager.addContactMethod(contactableId, type, value);
  }
});

FileUploader.createEndpoint('uploadResume', {
  onUpload: function (stream, metadata) {
    var employee = ContactableManager.createFromResume(stream);

    if (employee) {
      stream = fs.createReadStream(stream.path);
      var resumeId = S3Storage.upload(stream);

      if (!resumeId) {
        return new Meteor.Error(500, "Error uploading resume to S3");
      }

      var resume = {
        employeeId: employee,
        resumeId: resumeId,
        userId: Meteor.userId(),
        name: metadata.name,
        type: metadata.type,
        dateCreated: new Date()
      };
      return Resumes.insert(resume);
    } else {
      return new Meteor.Error(500, "Error during employee creation");
    }
  },
  onDownload: function(fileId) {
    return S3Storage.download(fileId);
  }
});

FileUploader.createEndpoint('uploadContactablesFiles', {
  onUpload: function (stream, metadata) {
    var fileId = S3Storage.upload(stream);

    if (!fileId) {
      return new Meteor.Error(500, "Error uploading resume to S3");
    }

    var file = {
      entityId: metadata.entityId,
      name: metadata.name,
      type: metadata.type,
      description: metadata.description,
      tags: metadata.tags,
      userId: Meteor.userId(),
      fileId: fileId
    };

    return ContactablesFiles.insert(file);
  },
  onDownload: function(fileId) {
    return S3Storage.download(fileId);
  }
});