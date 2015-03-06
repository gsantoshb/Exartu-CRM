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
        // TODO: Validate
        Contactables.update({_id: contactableId},
            {
                $addToSet: {
                    education: educationInfo
                }
            }
        );
    },
    editEducationRecord: function (contactableId, oldEducationInfo, newEducationInfo) {
        // TODO: Validate
        Contactables.update({
                _id: contactableId,
                education: oldEducationInfo
            }, {
                $set: {
                    'education.$': newEducationInfo
                }
            }
        );
    },
    deleteEducationRecord: function (contactableId, educationInfo) {
        // TODO: Validate
        Contactables.update({_id: contactableId}, {
            $pull: {
                'education': educationInfo
            }
        });
    },

    // Past jobs record
    addPastJobRecord: function (contactableId, pastJobInfo) {
        // TODO: Validate
        Contactables.update({_id: contactableId},
            {
                $addToSet: {
                    pastJobs: pastJobInfo
                }
            }
        );
    },
    editPastJobRecord: function (contactableId, oldPastJobInfo, newPastJobInfo) {
        // TODO: Validate
        Contactables.update({
                _id: contactableId,
                pastJobs: oldPastJobInfo
            }, {
                $set: {
                    'pastJobs.$': newPastJobInfo
                }
            }
        );
    },
    deletePastJobRecord: function (contactableId, pastJobInfo) {
        // TODO: Validate
        Contactables.update({_id: contactableId}, {
            $pull: {
                'pastJobs': pastJobInfo
            }
        });
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
    }
};