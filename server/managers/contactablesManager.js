var iconv = Meteor.npmRequire('iconv-lite');
var encode = function (string) {
    var stringIso = iconv.encode(string, "iso-8859-1");
    return stringIso.toString('base64');
};

var fs = Npm.require('fs');
var request = Meteor.npmRequire('request');


var xml2jsAsync = function (json) {
    var result = Meteor.wrapAsync(xml2js.parseString)(json);
    if (!result)
        return new Meteor.Error(500, "Error parsing resume");
    else
        return result;
};

ContactableManager = {
    create: function (contactable) {
        return Contactables.insert(contactable);
    },
    createFromResume: function (data) {
        var result = ResumeManager.parse(data);
        if (result instanceof Meteor.Error)
            throw result;
        if ((!result.person.firstName) || (!result.person.lastName)) {
            return null;
        }
        var employeeId = ContactableManager.create(result);
        if (result.location) {
            result.location.linkId = employeeId;
            result.location.hierId = Meteor.user()._id;
            result.location.addressTypeId = LookUpManager.getAddressTypeDefaultId();
            AddressManager.addEditAddress(result.location);
        }
        return employeeId;
    },
    getContactableByMail: function (mail, hierid) {
        //find a contactable in hierarchy:hier with mail: 'mail'
        //check by hierarchy
        var visibleHiers = Utils.filterByHiers(hierid);

        return Contactables.findOne({'contactMethods.value': mail, $or: visibleHiers});
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
                            if (ee.location) {
                                ee.location.linkId = employeeId;
                                ee.location.hierId = Meteor.user().currentHierId;
                                ee.location.addressTypeId = LookUpManager.getAddressTypeDefaultId();
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
    getDisplayName: function (contactable) {
        var displayName;
        if (contactable.person) {
            displayName = contactable.person.lastName + ', ' + contactable.person.firstName;
            if (contactable.person.middleName) contactable.displayName += ' ' + contactable.person.middleName;
        }
        if (contactable.organization) {
            displayName = contactable.organization.organizationName;
        }
        return displayName;
    },

    isTaxIdUnused: function (taxid, hierid) {
        if (!taxid) return true;
        var cnt = Contactables.find({'Employee.taxID': taxid, hierId: hierid}).count();
        return (cnt == 0) ? true : false;

    },

    getContactableFromPhoneNumber : function(phoneNumber,hierId) {
        // Get contactable with phone number equal to reply.From that belong to hier
        var contactable;
        var hierFilter =Utils.filterByHiers(hierId);
        var fromNumber = phoneNumber.trim();
        if (fromNumber.length >= 10) {
            // Craft phone number regex
            var areaCode = fromNumber.slice(fromNumber.length - 10, fromNumber.length - 7);
            var part1 = fromNumber.slice(fromNumber.length - 7, fromNumber.length - 4);
            var part2 = fromNumber.slice(fromNumber.length - 4, fromNumber.length);
            var regex = '(\\+1)?(\\()?' + areaCode + '(\\))?(\\-)?' + part1 + '(\\-)?' + part2;

            contactable = Contactables.findOne({
                'contactMethods.value': {$regex: regex, $options: 'x'},
                $or: hierFilter
            });
        } else {
            contactable = Contactables.findOne({
                'contactMethods.value': {$regex: fromNumber, $options: 'x'},
                $or: hierFilter
            });
        }

        return contactable;
    },

    // Notes
    addNote: function (note) {

        if (note.sendAsSMS) {
            // Send SMS to contactableId (which may be a contactable or a hotlist of contactables)
            TwilioManager.sendSMSToContactable(note.contactableId, note.userNumber, note.contactableNumber, note.msg, note.hotListFirstName);
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
            dateCreated: Date.now(),
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
        educationInfo.dateCreated = Date.now();;

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
        pastJobInfo.dateCreated = Date.now();;

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
        var pj = Contactables.findOne({_id:contactableId,'pastJobs.id':pastJobId},{fields:{'pastJobs.$':1}});
        var oldPastJob = pj.pastJobs[0];
        _.extend(oldPastJob,pastJobInfo)
        // Update the contactable with the new education record
        return Contactables.update({_id: contactableId, 'pastJobs.id': pastJobId},
            {$set: {'pastJobs.$': oldPastJob}}
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

        if (!Meteor.users.findOne({_id: userId})) throw new Error('User not found');

        Contactables.update(contactableId, {$set: {userId: userId}});
    },
    checkContactableEmail: function (email) {
        var userHierarchiesFilter = Utils.filterByHiers(Utils.getUserHierId(Meteor.userId()));
        return Contactables.find({'contactMethods.value': email, $or: userHierarchiesFilter}).fetch();
    },


    // CARD
    createFromCard: function (data, metadata) {
        var progressBarParsing = function (progressUpload, request) {

            Meteor.setTimeout(function () {
                if (progressUpload && request) {
                    if (!(request.req.connection.socket._bytesDispatched >= metadata.fileSize)) {

                        try {
                            progressUpload.set((request.req.connection.socket._bytesDispatched / metadata.fileSize) * 100);
                            progressBarParsing(progressUpload, request);
                        } catch (e) {
                            console.log("Error,", e)

                        }
                    }
                }
            }, 200);
        }


        var future = new Future();
        if (typeof data.read == 'function') {
            var logTok = metadata.loginToken;
            if (!logTok)
                throw new Meteor.Error(500, 'Login token required');
            var user = Meteor.users.findOne({'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(logTok)});
            if (!user)
                throw new Meteor.Error(500, 'Invalid login token');
            var progressUpload = ServerProgress.start(user._id, 'processCard_' + metadata.idProgressBar, 'Procesing...');
            progressUpload.set(0.1);
            var hierId = user.currentHierId;
            var hier = Hierarchies.findOne({_id: hierId});
            var cardR;
            if (!hier) throw new Meteor.Error(500, 'Invalid hierId');
            if (!hier.cardReader) {
                // look for the config in env
                if (ExartuConfig.CardReaderAppId && ExartuConfig.CardReaderPassword) {
                    cardR = {
                        appId: ExartuConfig.CardReaderAppId,
                        password: ExartuConfig.CardReaderPassword,
                        encoded: encode(ExartuConfig.CardReaderAppId + ':' + ExartuConfig.CardReaderPassword)
                    };
                }
                else {
                    future.throw(new Meteor.Error(500, 'No card reader'))
                }
            } else {
                cardR = hier.cardReader;
            }
            var formData = {
                m_file: data,
                exportFormat: 'xml'
            }

            var r = request.post({
                url: 'https://cloud.ocrsdk.com/processBusinessCard',
                headers: {'Authorization': 'Basic: ' + cardR.encoded},
                formData: formData
            }, Meteor.bindEnvironment(function optionalCallback(err, httpResponse, result) {
                if (err) {
                    return console.log('upload failed:', err);
                }
                if (httpResponse) {
                    if (progressUpload) {
                        progressUpload.end();
                        //delete progressUpload;
                    }
                    var object = xml2jsAsync(result);
                    var task = {}
                    task.id = object.response.task[0].$.id;
                    task.estimatedTime = parseInt(object.response.task[0].$.estimatedProcessingTime);
                    future.return({content: task});
                }
            }));

            progressBarParsing(progressUpload, r);


        }
        else {
            future.throw(new Meteor.Error(500, 'No data.read function'));
        }

        return future.wait();
    },
    parseCardReader: function (taskId) {
        var future = new Future();
        var hierId = Meteor.user().currentHierId;
        var hier = Hierarchies.findOne({_id: hierId});
        var cardR;
        if (!hier) throw new Meteor.Error(500, 'Invalid hierId');
        if (!hier.cardReader) {
            // look for the config in env
            if (ExartuConfig.CardReaderAppId && ExartuConfig.CardReaderPassword) {
                cardR = {
                    appId: ExartuConfig.CardReaderAppId,
                    password: ExartuConfig.CardReaderPassword,
                    encoded: encode(ExartuConfig.CardReaderAppId + ':' + ExartuConfig.CardReaderPassword)
                };
            }
            else {
                future.throw(new Meteor.Error(500, 'No card reader'))
            }
        } else {
            cardR = hier.cardReader;
        }
        HTTP.get('https://cloud.ocrsdk.com/getTaskStatus/?taskId=' + taskId, {headers: {'Authorization': 'Basic:' + cardR.encoded}}, function (err, r) {
            if (r) {
                var task = {};
                var resultObject = xml2jsAsync(r.content);
                task.status = resultObject.response.task[0].$.status;
                if (task.status === "Completed") {
                    console.log("completed");
                    task.resultUrl = resultObject.response.task[0].$.resultUrl;
                    console.log("taskurl", task.resultUrl);
                    HTTP.get(task.resultUrl, function (err, resultado) {

                        if (resultado) {
                            var objectR = xml2jsAsync(resultado.content);
                            var employee = {};
                            employee.hierId = Meteor.user().currentHierId;
                            employee.objNameArray = ['person', 'Employee', 'contactable'];
                            employee.person = {
                                firstName: '',
                                middleName: '',
                                lastName: ''
                            };
                            employee.Employee = {};
                            employee.contactMethods = [];
                            var mobilPhoneLookUp = LookUps.findOne({
                                lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
                                hierId: Meteor.user().currentHierId, lookUpActions: "ContactMethod_MobilePhone"
                            });
                            var emailLookUp = LookUps.findOne({
                                lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
                                hierId: Meteor.user().currentHierId, lookUpActions: "ContactMethod_Email"
                            });
                            var phoneTypeId = mobilPhoneLookUp._id;
                            var emailTypeId = emailLookUp._id;
                            console.log("phoneTypeId", phoneTypeId);
                            console.log("emailTypeId", emailTypeId);
                            var addressTypeId = LookUps.findOne({
                                lookUpCode: Enums.lookUpCodes.contactable_address,
                                lookUpActions: Enums.lookUpAction.Address_WorksSite,
                                hierId: Meteor.user().currentHierId
                            });
                            var address = "";
                            _.forEach(objectR.document.businessCard[0].field, function (f) {
                                switch (f.$.type) {
                                    case 'Phone':
                                    {
                                        employee.contactMethods.push({
                                            type: phoneTypeId,
                                            value: f.value[0]
                                        })
                                        break;
                                    }
                                    case 'Email':
                                    {
                                        employee.contactMethods.push({
                                            type: emailTypeId,
                                            value: f.value[0]
                                        })
                                        break;
                                    }
                                    case 'Address':
                                    {
                                        address = f.value[0];
                                        break;
                                    }
                                    case 'Name':
                                    {
                                        var nameArray = f.value[0].split(" ");
                                        if (nameArray.length > 2) {
                                            employee.person = {
                                                firstName: nameArray[0],
                                                middleName: nameArray[1],
                                                lastName: nameArray[2]
                                            };
                                        }
                                        else if (nameArray.length === 2) {
                                            employee.person.firstName = nameArray[0];
                                            employee.person.lastName = nameArray[1];
                                        }
                                        else if (nameArray.length === 1) {
                                            employee.person.firstName = nameArray[0];
                                            employee.person.lastName = nameArray[0];
                                        }
                                        break;
                                    }
                                    case 'Job':
                                    {
                                        employee.person.jobTitle = f.value[0];
                                        break;
                                    }
                                    case 'Text':
                                    {
                                        break;
                                    }
                                    default :
                                    {
                                        console.log(f);
                                    }
                                }
                            });
                            if (employee.person.firstName === '' || employee.person.lastName === '') {
                                future.return("Unable to parse");
                            }
                            else {
                                //var connection = new RESTAPI.connection(user);
                                var insertedEmployee = Meteor.call('addContactable', employee);
                                var toReturn = {content: insertedEmployee};
                                future.return(toReturn);

                                if (address) {
                                    HTTP.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address, function (err, cb) {
                                        if (cb) {
                                            var addr = {};
                                            addr.userId = Meteor.user()._id;
                                            addr.linkId = insertedEmployee;
                                            addr.hierId = Meteor.user().currentHierId;
                                            addr.addressTypeId = addressTypeId._id;
                                            addr.lat = cb.data.results[0].geometry.location.lat;
                                            addr.lng = cb.data.results[0].geometry.location.lng;
                                            _.forEach(cb.data.results[0].address_components, function (c) {
                                                if (_.contains(c.types, "postal_code")) {
                                                    addr.postalCode = c.long_name;
                                                }
                                                else if (_.contains(c.types, "locality")) {
                                                    addr.city = c.long_name;
                                                }
                                                else if (_.contains(c.types, "administrative_area_level_1")) {
                                                    addr.state = c.long_name;
                                                }
                                                else if (_.contains(c.types, "country")) {
                                                    addr.country = c.long_name;
                                                }
                                                else if (_.contains(c.types, "street_number")) {
                                                    addr.address = addr.address ? c.long_name + addr.address : c.long_name;
                                                }
                                                else if (_.contains(c.types, "route")) {
                                                    addr.address = addr.address ? addr.address + c.long_name : c.long_name;
                                                }
                                            })
                                            AddressManager.addEditAddress(addr);
                                            //var toReturn = {content: insertedEmployee};
                                            //future.return(toReturn);


                                        }
                                    })
                                }
                                else {
                                    //var toReturn = {content: insertedEmployee};
                                    //future.return(toReturn);
                                }
                            }
                        }
                    })
                }
                else {
                    future.return("Not completed yet");
                }
            }
            else {
                future.throw("Error, get failed");
            }
        });
        return future.wait();
    },
    updateContactMethod: function(contactableId, arrayToUpdate){
       //arrayToUpdate = [{newValue, oldValue, type}]
      _.each(arrayToUpdate, function(a)
      {
        var contactable = Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find({
          _id: contactableId,
          contactMethods: {$elemMatch: {value: a.oldValue, type: a.type}}
        })).fetch()[0]
        if (!contactable) {
          //throw error
        }
        else {
          Contactables.update({
            _id: contactableId,
            contactMethods: {type: a.type, value: a.oldValue}
          }, {$set: {"contactMethods.$": {type: a.type, value: a.newValue}}});
        }
      });
    },
    getContactableById: function(contactableId){
      return Contactables.findOne({_id:contactableId});
    },
    updateContactable: function(update, contactableId){
      //update a contactable using the "update" from the autoform on contactables details
      var querySet = {};
      var queryUnset = {};
      console.log("update",update);
      if(update.$set.personFirstName != undefined){
        _.extend(querySet, {'person.firstName':update.$set.personFirstName});
      }
      if(update.$set.personLastName != undefined){
        _.extend(querySet, {'person.lastName':update.$set.personLastName});
      }
      if(update.$set.personMiddleName != undefined){
        _.extend(querySet, {'person.middleName':update.$set.personMiddleName});
      }
      if(update.$set.personJobTitle != undefined){
        _.extend(querySet, {'person.jobTitle':update.$set.personJobTitle});
      }
      if(update.$set.personBirthDate!= undefined){
        _.extend(querySet, {'person.birthDate':update.$set.personBirthDate});
      }
      if(update.$set.organizationOrganizationName!= undefined){
        _.extend(querySet, {'organization.organizationName':update.$set.organizationOrganizationName});
      }
      if(update.$set.clientDepartment!= undefined){
        _.extend(querySet, {'Client.department':update.$set.clientDepartment});
      }
      if(update.$set.clientStatus!= undefined){
        _.extend(querySet, {'Client.status':update.$set.clientStatus});
      }
      if(update.$set.workerCompCode!= undefined){
        _.extend(querySet, {'Client.workerCompCode':update.$set.workerCompCode});
      }
      if(update.$set.employeeStatus!= undefined){
        _.extend(querySet, {'Employee.status':update.$set.employeeStatus});
      }
      if(update.$set.taxID!= undefined){
        _.extend(querySet, {'Employee.taxID':update.$set.taxID});
      }
      if(update.$set.contactStatus!= undefined){
        _.extend(querySet, {'Contact.status':update.$set.contactStatus});
      }
      if(update.$set.howHeardOf!= undefined){
        _.extend(querySet, {'howHeardOf':update.$set.howHeardOf});
      }
      if(update.$set.activeStatus!= undefined){
        _.extend(querySet, {'activeStatus':update.$set.activeStatus});
      }
      if(update.$set.statusNote!= undefined){
        _.extend(querySet, {'statusNote':update.$set.statusNote});
      }
      if(update.$set.clientLostReason!= undefined){
        _.extend(querySet, {'Client.lostReason':update.$set.clientLostReason});
      }
      if(update.$set.hasTransportation != undefined){
        _.extend(querySet, {'Employee.hasTransportation':update.$set.hasTransportation});
      }
      if(update.$set.desiredPay != undefined){
        _.extend(querySet, {'Employee.desiredPay':update.$set.desiredPay});
      }
      if(update.$set.dateAvailable!= undefined ){
        _.extend(querySet, {'Employee.dateAvailable':update.$set.dateAvailable});
      }
      if(update.$set.user != undefined ){
        _.extend(querySet, {'userId':update.$set.user});
      }
      if(update.$set.availableStartDate != undefined){
        var availableStart = {};
        _.forEach(update.$set.availableStartDate, function(a){
          if(a === "Sunday"){
            availableStart["0"] = true;
          } if(a === "Monday"){
            availableStart["1"] = true;
          } if(a === "Tuesday"){
            availableStart["2"] = true;
          } if(a === "Wednesday"){
            availableStart["3"] = true;
          } if(a === "Thursday"){
            availableStart["4"] = true;
          } if(a === "Friday"){
            availableStart["5"] = true;
          } if(a === "Saturday"){
            availableStart["6"] = true;
          }
        })
        _.extend(querySet, {'Employee.availableStartDate': availableStart});
      }
      if(update.$set.availableShifts!= undefined ){
        var availableSh = {};
        _.forEach(update.$set.availableShifts, function(a){
          if(a === "1st shift"){
            availableSh["1"] = true;
          } if(a === "2nd shift"){
            availableSh["2"] = true;
          } if(a === "3rd shift"){
            availableSh["3"] = true;
          }
        })
        _.extend(querySet, {'Employee.availableShifts': availableSh});
      }
      if(update.$set['preferredWorkLocation.street'])
        _.extend(querySet, {'Employee.preferredWorkLocation.address':update.$set['preferredWorkLocation.street']})
      if(update.$set['preferredWorkLocation.state'])
        _.extend(querySet, {'Employee.preferredWorkLocation.state':update.$set['preferredWorkLocation.state']})
      if(update.$set['preferredWorkLocation.city'])
        _.extend(querySet, {'Employee.preferredWorkLocation.city':update.$set['preferredWorkLocation.city']})
      if(update.$set['preferredWorkLocation.country'])
        _.extend(querySet, {'Employee.preferredWorkLocation.country':update.$set['preferredWorkLocation.country']})
      if(update.$set['preferredWorkLocation.lat'])
        _.extend(querySet, {'Employee.preferredWorkLocation.lat':update.$set['preferredWorkLocation.lat']})
      if(update.$set['preferredWorkLocation.lng'])
        _.extend(querySet, {'Employee.preferredWorkLocation.lng':update.$set['preferredWorkLocation.lng']})

      if(update.$unset) {
        if (update.$unset.personMiddleName != undefined) {
          _.extend(queryUnset, {'person.middleName': update.$unset.personMiddleName});
        }
        if (update.$unset.personJobTitle != undefined) {
          _.extend(queryUnset, {'person.jobTitle': update.$unset.personJobTitle});
        }
        if (update.$unset.personBirthDate != undefined) {
          _.extend(queryUnset, {'person.birthDate': update.$unset.personBirthDate});
        }
        if (update.$unset.clientDepartment != undefined) {
          _.extend(queryUnset, {'Client.department': update.$unset.clientDepartment});
        }
        if (update.$unset.clientStatus != undefined) {
          _.extend(queryUnset, {'Client.status': update.$unset.clientStatus});
        }
        if (update.$unset.workerCompCode != undefined) {
          _.extend(queryUnset, {'Client.workerCompCode': update.$unset.workerCompCode});
        }
        if (update.$unset.employeeStatus != undefined) {
          _.extend(queryUnset, {'Employee.status': update.$unset.employeeStatus});
        }
        if (update.$unset.taxID != undefined) {
          _.extend(queryUnset, {'Employee.taxID': update.$unset.taxID});
        }
        if (update.$unset.contactStatus != undefined) {
          _.extend(queryUnset, {'Contact.status': update.$unset.contactStatus});
        }
        if (update.$unset.howHeardOf != undefined) {
          _.extend(queryUnset, {'howHeardOf': update.$unset.howHeardOf});
        }
        if (update.$unset.activeStatus != undefined) {
          _.extend(queryUnset, {'activeStatus': update.$unset.activeStatus});
        }
        if (update.$unset.statusNote != undefined) {
          _.extend(queryUnset, {'statusNote': update.$unset.statusNote});
        }
        if (update.$unset.clientLostReason != undefined) {
          _.extend(queryUnset, {'Client.lostReason': update.$unset.clientLostReason});
        }
        if (update.$unset.hasTransportation != undefined) {
          _.extend(queryUnset, {'Employee.hasTransportation': update.$unset.hasTransportation});
        }
        if (update.$unset.desiredPay != undefined) {
          _.extend(queryUnset, {'Employee.desiredPay': update.$unset.desiredPay});
        }
        if (update.$unset.dateAvailable != undefined) {
          _.extend(queryUnset, {'Employee.dateAvailable': update.$unset.dateAvailable});
        }
        if (update.$unset.availableStartDate != undefined) {
          _.extend(queryUnset, {'Employee.availableStartDate': ""});
        }
        if (update.$unset.availableShifts != undefined) {
          _.extend(queryUnset, {'Employee.availableShifts': ""});
        }
      }
      var update = {};
      if(!_.isEmpty(querySet))
        update.$set = querySet;
      if(!_.isEmpty(queryUnset))
        update.$unset = queryUnset;
      Contactables.update({_id: contactableId},update);
    },
    updateLegalInfo: function(update, contactableId){
      var querySet = {};
      var queryUnset = {};

      if(update.$set.convictions ){
        _.extend(querySet, {'Employee.convictions':update.$set.convictions});
      }
      if(update.$set.gender ){
        _.extend(querySet, {'Employee.gender':update.$set.gender});
      }
      if(update.$set.ethnicity ){
        _.extend(querySet, {'Employee.ethnicity':update.$set.ethnicity});
      }
      if(update.$set.i9OnFile ){
        _.extend(querySet, {'Employee.i9OnFile':update.$set.i9OnFile});
      }
      if(update.$set.i9ExpireDate ){
        _.extend(querySet, {'Employee.i9ExpireDate':update.$set.i9ExpireDate});
      }
      if(update.$set.dependentNumber ){
        _.extend(querySet, {'Employee.dependentNumber':update.$set.dependentNumber});
      }
      if(update.$set.orientationDate ){
        _.extend(querySet, {'Employee.orientationDate':update.$set.orientationDate});
      }
      if(update.$set.hireDate ){
        _.extend(querySet, {'Employee.hireDate':update.$set.hireDate});
      }

      if(update.$unset) {
        if(update.$unset.convictions != undefined){
          _.extend(queryUnset, {'Employee.convictions':update.$unset.convictions});
        }
        if(update.$unset.gender!= undefined ){
          _.extend(queryUnset, {'Employee.gender':update.$unset.gender});
        }
        if(update.$unset.ethnicity != undefined){
          _.extend(queryUnset, {'Employee.ethnicity':update.$unset.ethnicity});
        }
        if(update.$unset.i9OnFile != undefined){
          _.extend(queryUnset, {'Employee.i9OnFile':update.$unset.i9OnFile});
        }
        if(update.$unset.i9ExpireDate!= undefined ){
          _.extend(queryUnset, {'Employee.i9ExpireDate':update.$unset.i9ExpireDate});
        }
        if(update.$unset.dependentNumber!= undefined ){
          _.extend(queryUnset, {'Employee.dependentNumber':update.$unset.dependentNumber});
        }
        if(update.$unset.orientationDate!= undefined ){
          _.extend(queryUnset, {'Employee.orientationDate':update.$unset.orientationDate});
        }
        if(update.$unset.hireDate!= undefined ){
          _.extend(queryUnset, {'Employee.hireDate':update.$unset.hireDate});
        }
      }

      var update = {};
      if(!_.isEmpty(querySet))
        update.$set = querySet;
      if(!_.isEmpty(queryUnset))
        update.$unset = queryUnset;
      Contactables.update({_id: contactableId},update);

    },

    // Documents
    getDocumentDownloadURL: function (fileId) {
      // Validate parameters
      if (!fileId) throw new Error("File ID is required");

      var file = ContactablesFiles.findOne({fileId: fileId});
      if (!file) throw new Error("Invalid file ID");

      try {
        return AWS_S3.getSignedUrl(ExartuConfig.AWS_S3_bucket, fileId);
      } catch (err) {
        throw new Meteor.Error(err.message);
      }
    }
};

