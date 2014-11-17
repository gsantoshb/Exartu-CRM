var fs = Meteor.npmRequire('fs');

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

  // Notes
  addContactableNote: function (note) {
    ContactableManager.addNote(note);
  },

  // Contact methods
  addContactMethod: function (contactableId, type, value) {
    ContactableManager.addContactMethod(contactableId, type, value);
  },
  getContactMethods: function (contactableId) {
    return ContactableManager.getContactMethods(contactableId);
  },

  setContactableAddress: function (contactableId, address) {
    ContactableManager.setAddress(contactableId, address);
  },
  getAddress: function (contactableId) {
    return ContactableManager.getAddress(contactableId);
  },

  // Education
  addEducationRecord: function (contactableId, educationInfo) {
    ContactableManager.addEducationRecord(contactableId, educationInfo);
  },
  editEducationRecord: function (contactableId, oldEducationInfo, newEducationInfo) {
    ContactableManager.editEducationRecord(contactableId, oldEducationInfo, newEducationInfo);
  },
  deleteEducationRecord: function (contactableId, educationInfo) {
    ContactableManager.deleteEducationRecord(contactableId, educationInfo);
  },

  // Past jobs
  addPastJobRecord: function (contactableId, pastJobInfo) {
    ContactableManager.addPastJobRecord(contactableId, pastJobInfo);
  },
  editPastJobRecord: function (contactableId, oldPastJobInfo, newPastJobInfo) {
    ContactableManager.editPastJobRecord(contactableId, oldPastJobInfo, newPastJobInfo);
  },
  deletePastJobRecord: function (contactableId, pastJobInfo) {
    ContactableManager.deletePastJobRecord(contactableId, pastJobInfo);
  },
  findCustomer: function (query) {
    return Utils.filterCollectionByUserHier.call({ userId: Meteor.userId() }, Contactables.find({
      'organization.organizationName': {
        $regex: '.*' +  query + '.*',
        $options: 'i'
      }
    }, { fields: { 'organization.organizationName': 1 } })).fetch();
  },
  getLastCustomer: function () {
    var user = Meteor.user();
    if (user.lastCustomerUsed) {
      return Contactables.findOne({ _id: user.lastCustomerUsed }, { fields: { 'organization.organizationName': 1 } });
    } else {
      return Contactables.findOne({ houseAccount: true, hierId: user.hierId }, { fields: { 'organization.organizationName': 1 } });
    }
  },

  // Communication
  sendSMSToContactable: function (contactableId, from, to, text) {
   return SMSManager.sendSMSToContactable(contactableId, from, to, text);
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
        extension: metadata.extension,
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
      extension: metadata.extension,
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

// Resume generator

FileUploader.createEndpoint('generateResume', {
  onDownload: function(employeeId, options, writeStream) {
    var employee = Contactables.findOne(employeeId);
    if (!employee || employee.objNameArray.indexOf('Employee') == -1)
      throw new Meteor.Error(404, 'Employee not found');

    var resume = new Resume(writeStream);

    // General information
    resume.title("General information");
    resume.entry('First name', employee.person.firstName);
    resume.entry('Last name', employee.person.lastName);
    if (employee.location)
      resume.entry('Address', Utils.getLocationDisplayName(employee.location));

    // Contact method
    if (options.showContactInfo == 'true' && employee.contactMethods) {
      resume.title("Contact methods");
      _.forEach(employee.contactMethods, function (contactMethod) {
        resume.contactMethodEntry(contactMethod);
      });
    }

    // Education
    if (employee.education) {
      resume.title("Education");
      _.forEach(employee.education, function (education) {
        resume.educationEntry(education);
      });
    }

    // Past jobs
    if (employee.pastJobs) {
      resume.title("Past Jobs");
      _.forEach(employee.pastJobs, function (pastJob) {
        resume.pastJobEntry(pastJob);
      });
    }

    // Tags
    if (employee.tags) {

      resume.title("Characteristics and skills");
      _.forEach(employee.tags, function (tag) {
        resume.tagEntry(tag);
      });
    }

    resume.end();
  }
});

var PDFDocument = Meteor.npmRequire('pdfkit');

var Resume = function (writeStream) {
  var self = this;

  self.doc = new PDFDocument();
  self.doc.pipe(writeStream);
};

Resume.prototype.end = function () {
  this.doc.end();
};

Resume.prototype.title = function (text) {
  var self = this;

  self.doc.moveDown();
  self.doc.moveDown();

  self.doc.fontSize(16).text(text, { underline: true});
  self.doc.moveDown();
};

Resume.prototype.entry = function (label, value) {
  var self = this;

  self.doc.fontSize(12).text(label + ': ' + value);
};/**/

Resume.prototype.contactMethodEntry = function (contactMethod) {
  var self = this;

  var type= ContactMethods.findOne(contactMethod.type);
  if (!type) return;

  self.doc.fontSize(11).text(type.displayName + ' ' + contactMethod.value);
};

Resume.prototype.educationEntry = function (education) {
  var self = this;

  self.doc.fontSize(12).text(education.start.toLocaleDateString("en-US") + ' - '
  + (education.end ? education.end.toLocaleDateString("en-US") : 'to present'), {
    continued: true,
    align: 'left'
  });

  self.doc.fontSize(12).text(education.description + ' , ' + education.institution, {
    align: 'right'
  });

  self.doc.moveDown();
};

Resume.prototype.pastJobEntry = function (pastJob) {
  var self = this;

  self.doc.fontSize(12).text(pastJob.start.toLocaleDateString("en-US") + ' - '
  + (pastJob.end ? pastJob.end.toLocaleDateString("en-US") : 'to present'), {
    continued: true,
    aling: 'left'
  });

  self.doc.fontSize(12).text(pastJob.company + ' , ' + pastJob.position, {
    align: 'right'
  });

  self.doc.moveDown();
};

Resume.prototype.tagEntry = function (tag) {
  var self = this;

  self.doc.fontSize(11).text(tag);
};
