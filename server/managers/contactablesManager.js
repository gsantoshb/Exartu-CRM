ContactableManager = {
    create: function (contactable) {
      return Contactables.insert(contactable);
    },
    createFromResume: function (stream) {
        var result = ResumeManager.parse(stream);
        if (result instanceof Meteor.Error)
            throw result;

        var employeeId= ContactableManager.create(result);
        if (result.location)
        {
            result.location.linkId=employeeId;
            result.location.hierId=Meteor.user()._id;
            result.location.addressTypeId=LookUpManager.getAddressTypeDefaultId();
            AddressManager.addEditAddress(result.location);
        }
        return employeeId;
    },
    getContactableByMail: function(mail, hierid){
      //find a contactable in hierarchy:hier with mail: 'mail'
      //check by hierarchy
      var visibleHiers = Utils.filterByHiers(hierid);

      return  Contactables.findOne({ 'contactMethods.value': mail,$or: visibleHiers });
    },
    createFromPlainResume: function (text) {
        var future = new Future();

        HTTP.post(
            'http://xr2demo.tempworks.com/resumeparser/api/Parser/ParseFromString',
            {
                data: text
            },
            function (error, result) {
                if (error)
                    future.throw(error);
                else {

                    // Parse the result
                    var json = EJSON.parse(result.content);
                    xml2js.parseString(json, Meteor.bindEnvironment(function (error, result) {
                        if (error)
                            future.throw(error);
                        else {

                            // Create new Employee
                            var ee = ResumeManager.extractInformation(result);
                            var employeeId = ContactableManager.create(ee);
                            if (ee.location)
                            {
                                ee.location.linkId=employeeId;
                                ee.location.hierId=Meteor.user().currentHierId;
                                ee.location.addressTypeId=LookUpManager.getAddressTypeDefaultId();
                                AddressManager.addEditAddress(ee.location);
                            }
                        }
                    }));
                }
            }
        );

        return future.wait();
    },
    setPicture: function (contactableId, fileId) {
        Contactables.update({
            _id: contactableId
        }, {
            $set: {
                pictureFileId: fileId
            }
        });
    },

    getContactMethodTypes: function () {
        var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
        return LookUps.find({hierId: rootHier, lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
    },
    addContactMethod: function (contactableId, type, value) {
        // Validation
        if (!contactableId) {
            throw new Error('Contactable ID is required');
        }
        if (type === undefined) {
            throw new Error('Contact method type is required');
        }
        if (!value) {
            throw new Error('Contact method value is required');
        }

        var contactMethodType = LookUps.findOne({
            _id: type,
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode
        });
        if (!contactMethodType) {
            throw new Error('Invalid contact method type');
        }
        //check if email is unique
        //if((contactMethodType.lookUpCode === Enums.lookUpTypes.contactMethod.type.lookUpCode)&&(_.contains(contactMethodType.lookUpActions, Enums.lookUpAction.ContactMethod_Email))){
        //  var rootHier = Utils.getHierTreeRoot(Meteor.user().currentHierId);
        //  var arrayEmail = LookUps.find({hierId: rootHier, lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode, lookUpActions:Enums.lookUpAction.ContactMethod_Email }).fetch();
        //  var pluckedArrayEmail = _.pluck(arrayEmail, '_id');
        //  var c = Contactables.findOne({'contactMethods.type': {$in:pluckedArrayEmail}, 'contactMethods.value':value})
        //  if(c){
        //    throw new Error("Error, Contact email must be unique");
        //  }
        //}



        // Conctact method insertion
        Contactables.update({_id: contactableId}, {
            $addToSet: {
                contactMethods: {
                    type: type,
                    value: value
                }
            }
        }, function (err, result) {
            if (err) {
                throw err;
            }
            return result;
        });
    },
    getContactMethods: function (contactableId) {
        // Validation
        if (!contactableId) {
            throw new Error('Contactable ID is required');
        }

        var contactable = Contactables.findOne({_id: contactableId}, {fields: {contactMethods: 1}});

        return contactable ? contactable.contactMethods : [];
    },

    isTaxIdUnused: function (taxid, hierid) {
        if (!taxid) return true;
        var cnt = Contactables.find({'Employee.taxID': taxid, hierId: hierid}).count();
        return (cnt == 0) ? true : false;

    },

    // Notes
    addNote: function (note) {

        if (note.sendAsSMS) {
            // Send SMS to contactableId (which may be a contactable or a hotlist of contactables)
            SMSManager.sendSMSToContactable(note.contactableId, note.userNumber, note.contactableNumber, note.msg, note.hotListFirstName);
        }

        // Save note
        Notes.insert(note);
    },
    addEmployeeNote: function (message, employeeId) {
        // Validations
        if (!message) throw new Error('Message is required');
        if (!employeeId) throw new Error('Employee ID is required');
        var employee = Contactables.findOne({_id: employeeId, Employee: {$exists: true}});
        if (!employee) throw new Error('Invalid employee ID');
        var appCenterUser = Meteor.users.findOne({_id: employee.user});
        if (!appCenterUser) throw new Error('Employee does not have an Applicant Center account');

        var note = {
            msg: message,
            links: [{id: employeeId, type: Enums.linkTypes.contactable.value}],
            contactableId: employeeId,
            dateCreated: new Date(),
            hierId: employee.hierId,
            userId: appCenterUser._id,
            displayToEmployee: true
        };

        // Insert note
        return Notes.insert(note);
    },

  // Education record
  addEducationRecord: function (contactableId, educationInfo) {
    // Validations
    if (!contactableId) throw new Error('Contactable ID is required');
    if (!educationInfo.institution) throw new Error('Institution name is required');
    if (!educationInfo.description) throw new Error('Description is required');
    if (!educationInfo.start) throw new Error('Start date is required');

    // Generate a new ID for the education record for easier manipulation
    educationInfo.id = Random.id();

    // Update the contactable with the new education record
    return Contactables.update({_id: contactableId}, {$addToSet: {education: educationInfo}});
  },
  editEducationRecord: function (contactableId, educationId, educationInfo) {
    // Validations
    if (!contactableId) throw new Error('Contactable ID is required');
    if (!educationId) throw new Error('Education ID is required');
    if (!educationInfo.institution) throw new Error('Institution name is required');
    if (!educationInfo.description) throw new Error('Description is required');
    if (!educationInfo.start) throw new Error('Start date is required');

    // Make the ID available in the new record
    educationInfo.id = educationId;

    // Update the contactable with the new education record
    return Contactables.update({_id: contactableId, 'education.id': educationId},
      {$set: {'education.$': educationInfo}}
    );
  },
  deleteEducationRecord: function (contactableId, educationId) {
    // Validations
    if (!contactableId) throw new Error('Contactable ID is required');
    if (!educationId) throw new Error('Education ID is required');

    // Remove the education record from the contactable
    return Contactables.update({_id: contactableId}, {$pull: {education: {id: educationId}}});
  },

    // Past jobs record
    addPastJobRecord: function (contactableId, pastJobInfo) {
      // Validations
      if (!contactableId) throw new Error('Contactable ID is required');
      if (!pastJobInfo.company) throw new Error('Company name is required');
      if (!pastJobInfo.location) throw new Error('Location is required');
      if (!pastJobInfo.position) throw new Error('Position is required');
      if (!pastJobInfo.start) throw new Error('Start date is required');

      // Generate a new ID for the past job record for easier manipulation
      pastJobInfo.id = Random.id();

      // Update the contactable with the new education record
      return Contactables.update({_id: contactableId}, {$addToSet: {pastJobs: pastJobInfo}});
    },
    editPastJobRecord: function (contactableId, pastJobId, pastJobInfo) {
      // Validations
      if (!contactableId) throw new Error('Contactable ID is required');
      if (!pastJobId) throw new Error('Past Job ID is required');
      if (!pastJobInfo.company) throw new Error('Company name is required');
      if (!pastJobInfo.location) throw new Error('Location is required');
      if (!pastJobInfo.position) throw new Error('Position is required');
      if (!pastJobInfo.start) throw new Error('Start date is required');

      // Make the ID available in the new record
      pastJobInfo.id = pastJobId;

      // Update the contactable with the new education record
      return Contactables.update({_id: contactableId, 'pastJobs.id': pastJobId},
        {$set: {'pastJobs.$': pastJobInfo}}
      );
    },
    deletePastJobRecord: function (contactableId, pastJobId) {
      // Validations
      if (!contactableId) throw new Error('Contactable ID is required');
      if (!pastJobId) throw new Error('Past Job ID is required');

      // Remove the education record from the contactable
      return Contactables.update({_id: contactableId}, {$pull: {pastJobs: {id: pastJobId}}});
    },

    // Client relations
    setClient: function (contactId, clientId) {
        var userHierarchiesFilter = Utils.filterByHiers(Utils.getUserHierId(Meteor.userId()));

        // Get contact
        var contact = Contactables.findOne({_id: contactId, Contact: {$exists: true}, $or: userHierarchiesFilter});

        // Check if job exists in user's hierarchies
        if (!contact)
            throw new Meteor.Error(404, 'Contact with id ' + contactId + ' not found');

        // If clientId is defined then validate client, if not set job's client as null
        if (clientId) {
            // Get client
            var client = Contactables.find({_id: clientId, Client: {$exists: true}, $or: userHierarchiesFilter});

            // Check if it exists in user's hierarchies
            if (clientId && !client)
                throw new Meteor.Error(404, 'Client with id ' + clientId + ' not found');
        }

        // Update job client
        Contactables.update({_id: contactId}, {$set: {'Contact.client': clientId}});
    },

  changeContactableUserId: function (contactableId, userId) {
    //todo: if isAdmin

    if (! Meteor.users.find(userId).count()){
      throw new Error('userNot found');
    }

    Contactables.update(contactableId, { $set: {userId: userId} });
  },
  checkContactableEmail: function(email){
    var userHierarchiesFilter = Utils.filterByHiers(Utils.getUserHierId(Meteor.userId()));
    return Contactables.find({ 'contactMethods.value': email,$or: userHierarchiesFilter }).fetch();
  }
};