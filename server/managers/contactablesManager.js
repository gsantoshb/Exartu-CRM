var iconv = Meteor.npmRequire('iconv-lite');
var encode = function (string) {
  var stringIso = iconv.encode(string, "iso-8859-1");
  return stringIso.toString('base64');
};

var fs = Npm.require('fs');
var request = Meteor.npmRequire('request');


var xml2jsAsync = function (json) {
  var result = Meteor.wrapAsync(xml2js.parseString)(json);
  if (!result )
    return new Meteor.Error(500, "Error parsing resume");
  else
    return result;
};

ContactableManager = {
  create: function (contactable) {
    return Contactables.insert(contactable);
  },
  createFromResume: function (stream) {
    var result = ResumeManager.parse(stream);
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

    if (!Meteor.users.find(userId).count()) {
      throw new Error('userNot found');
    }

    Contactables.update(contactableId, {$set: {userId: userId}});
  },
  checkContactableEmail: function (email) {
    var userHierarchiesFilter = Utils.filterByHiers(Utils.getUserHierId(Meteor.userId()));
    return Contactables.find({'contactMethods.value': email, $or: userHierarchiesFilter}).fetch();
  },


  // CARD
  createFromCard: Meteor.wrapAsync(function (data, metadata, callback) {
    var maxTime = 30 * 1000;
    if (typeof data.read == 'function') {
      var logTok = metadata.loginToken;
      if (!logTok)
        throw new Meteor.Error(500, 'Login token required');
      var user = Meteor.users.findOne({'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(logTok)});
      if (!user)
        throw new Meteor.Error(500, 'Invalid login token');
      var progressUpload = ServerProgress.start(user._id, 'uploadCard', 'Procesing...');
      progressUpload.set(0.1);
      var hierId = user.currentHierId;
      var hier = Hierarchies.findOne({_id: hierId});
      var cardR;
      if (!hier) throw new Meteor.Error(500, 'Invalid hierId');
      if (!hier.cardReader) {
        // look for the config in env
        if (process.env.CardReaderAppId && process.env.CardReaderPassword) {
          cardR = {
            appId: process.env.CardReaderAppId,
            password: process.env.CardReaderPassword,
            encoded: encode(process.env.CardReaderAppId + ':' + process.env.CardReaderPassword)
          };
        }
        else {
          callback(new Meteor.Error(500, 'No card reader'))
        }
      } else {
        cardR = hier.cardReader;
      }
      var uploaded = 0;
      var uploadSize = 0;
      var formData = {
        m_file: data,
        exportFormat: 'xml'
      }



      var r = request.post({
        url: 'https://cloud.ocrsdk.com/processBusinessCard',
        headers: {'Authorization':'Basic: ' + cardR.encoded},
        formData: formData
      },Meteor.bindEnvironment(function optionalCallback(err, httpResponse, result) {
        if (err) {
          return console.log('upload failed:', err);
        }
        if (httpResponse) {
          try {
            progressUpload.end();
            delete progressUpload;
            Meteor.clearInterval(uploadInterval);
            var progress = ServerProgress.start(user._id, 'processCard', 'Parsing...');
            var object = xml2jsAsync(result);
            var task = {}
            task.id = object.response.task[0].$.id;
            task.estimatedTime = parseInt(object.response.task[0].$.estimatedProcessingTime);
            var totalTime = 0;
            var totalBar = 80;

            progress.set(0);
            var intervalBar = Meteor.setInterval(function () {
              progress.set(progress.progress + ((500 * totalBar) / (task.estimatedTime * 1000)));
            }, 500);

            var interval = Meteor.setInterval(function () {
              console.log("interval", totalTime);
              HTTP.get('https://cloud.ocrsdk.com/getTaskStatus/?taskId=' + task.id, {headers: {'Authorization': 'Basic:' + cardR.encoded}}, function (err, r) {

                if (r) {


                  //var resultObject = EJSON.parse(r.content);
                  var resultObject = xml2jsAsync(r.content);

                  task.status = resultObject.response.task[0].$.status;
                  if (task.status = "Completed") {
                    Meteor.clearInterval(intervalBar);
                    Meteor.clearInterval(interval);
                    task.resultUrl = resultObject.response.task[0].$.resultUrl;
                    console.log("content", r.content);
                    console.log("resultObject", resultObject);
                    console.log("taskurl", task.resultUrl);
                    HTTP.get(task.resultUrl, function (err, resultado) {
                      var objectR = xml2jsAsync(resultado.content);
                      var employee = {};
                      employee.hierId = user.currentHierId;
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
                        hierId: user.currentHierId, lookUpActions: "ContactMethod_MobilePhone"});
                      var emailLookUp = LookUps.findOne({
                        lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
                        hierId: user.currentHierId, lookUpActions: "ContactMethod_Email"});
                      var phoneTypeId = mobilPhoneLookUp._id;
                      var emailTypeId = emailLookUp._id;
                      console.log("phoneTypeId",phoneTypeId);
                      console.log("emailTypeId", emailTypeId);
                      var addressTypeId = LookUps.findOne({
                        lookUpCode: Enums.lookUpCodes.contactable_address,
                        lookUpActions: Enums.lookUpAction.Address_WorksSite,
                        hierId: user.currentHierId
                      });
                      var faxTypeId = LookUpManager.ContactMethodTypes_
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
                      if(employee.person.firstName === '' || employee.person.lastName === ''){
                        employee.person.firstName = "CardReader";
                        employee.person.lastName = "Employee";
                      }
                      var connection = new RESTAPI.connection(user);
                      var insertedEmployee = connection.call('addContactable', employee);

                      if (address) {
                        HTTP.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address, function (err, cb) {
                          if (cb) {
                            var addr = {};
                            addr.userId = user._id;
                            addr.linkId = insertedEmployee;
                            addr.hierId = user.currentHierId;
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

                            var toReturn = {content: insertedEmployee};
                            progress.end();
                            delete progress;
                            callback(null, toReturn);
                          }
                        })
                      }
                      else {
                        Meteor.clearInterval(interval);
                        Meteor.clearInterval(intervalBar);
                        var toReturn = {content: insertedEmployee};
                        if(progress){
                          progress.end();
                          delete progress;
                        }
                        callback(null, toReturn);
                      }
                    })
                  }
                  else {
                    totalTime = totalTime + task.estimatedTime * 1000;
                    totalBar = (100 - totalBar) / 2;
                    if (totalTime > maxTime) {
                      Meteor.clearInterval(interval);
                      Meteor.clearInterval(intervalBar);
                    }
                  }
                }else{
                  Meteor.clearInterval(intervalBar);
                  Meteor.clearInterval(interval);
                  console.log("Error parsing");
                }
              })
            }, task.estimatedTime * 1000);


            //return object;
          } catch (e) {
            console.log(e);
            callback(new Meteor.Error(500, "Error parsing resume"));
          }
        }
      }))


      var uploadInterval = Meteor.setInterval(function () {
        //console.log("Uploaded:",(r.req.connection._bytesDispatched/metadata.fileSize)*100);
        if (r.req.connection._bytesDispatched >= metadata.fileSize) {

        }
        else {
          progressUpload.set((r.req.connection._bytesDispatched / metadata.fileSize) * 100);
        }


      }, 200);

      r.on('response', function(response){
         //console.log(response);

      })
      //r.on('data', function(data){
      //  console.log(data);
      //})


      //  var result = "";
      //
      //  //response.setEncoding('utf8');
      //  response.on('data', function (chunk) {
      //      result += chunk;
      //  });
      //
      //  var err = Meteor.wrapAsync(response.on, response)('end');
      //  if (err) return err;
      //} else if (data instanceof String) {
      //  // TODO: parse string
      //}
      //

    }
  })
}
//
//Router.map(function() {
//  // Job Titles
//  this.route('getEmployeeFromCard' , {
//    where: 'server',
//    path: '/getEmployeeFromCard',
//    action: function () {
//       switch (this.request.method) {
//         case 'GET':
//          //var contactableId = this.params.query.contactableId;
//          //try {
//          //  var res = connection.call('getAddress', contactableId);
//          //
//          //  // Transform the response before sending it back
//          //  res = mapper.get(res, contactableId);
//          //  response.end(res);
//          //} catch (err) {
//          //  console.log(err);
//          //  response.error(err.message);
//          //}
//          break;
//         case 'POST':
//          //console.log('file:', this.request.file);
//          //console.log(this.request);
//          var logTok =  this.request.bodyFields.loginToken;
//          console.log(logTok);
//          if (! logTok)
//            throw new Meteor.Error(500, 'Login token required');
//
//          var user = Meteor.users.findOne({'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(logTok)});
//          console.log('user', user);
//          if (! user)
//            throw new Meteor.Error(500, 'Invalid login token');
//          var hierId =  user.currentHierId;
//          var hier = Hierarchies.findOne({_id: hierId});
//          var fileObject =  this.request.file;
//          var fs = Npm.require('fs');
//           var cardR;
//           if (! hier) return null;
//           if (! hier.cardReader){
//             // look for the config in env
//             if (process.env.CardReaderAppId && process.env.CardReaderPassword){
//               cardR = {
//                 appId: process.env.CardReaderAppId,
//                 password: process.env.CardReaderPassword,
//                 encoded: encode(process.env.CardReaderAppId + ':' + process.env.CardReaderPassword)
//               };
//             }
//             else{
//               throw new Meteor.Error(500, 'No card reader');
//             }
//           }
//           else{
//             cardR = hier.cardReader;
//           }
//           var formData = new FormData();
//          //fs.readFile(fileObject.path,Meteor.bindEnvironment( function(err, files){
//          //  err;
//          //  files;
//         var files = fs.createReadStream(fileObject.path);
//
//          formData.append('file', files);
//          formData.append('exportFormat', 'xml');
//
//          console.log(cardR);
//          if(cardR){
//
//            var headers = _.extend(formData.getHeaders(), {
//              'Accept-Encoding': 'gzip,deflate',
//              'Accept': 'application/json',
//              'Authorization':'Basic: ' + cardR.encoded
//            });
//
//            var response = Meteor.wrapAsync(formData.submit, formData)({
//              host: "http://cloud.ocrsdk.com",
//              path: "/processBusinessCard",
//              headers: headers
//            });
//
//            var result = "";
//
//            //response.setEncoding('utf8');
//            response.on('data', function (chunk) {
//              result += chunk;
//            });
//              //console.log('first cb');
//              //HTTP.post('http://cloud.ocrsdk.com/processBusinessCard', {
//              //  params: formData,
//              //  headers: {'Authorization':'Basic: ' + cardR.encoded}
//              //}, function(err, result) {
//              //  //var json = EJSON.parse(result.content);
//              //  //debugger;
//              //  //xml2js.parseString(result.content, function(err,res){
//              //  //  debugger;
//              //  //})
//              //
//              //  console.log('error', err);
//              //  console.log('result', result);
//              //  var parser;
//              //  var xmlDoc;
//              //  if (window.DOMParser)
//              //  {
//              //    parser=new DOMParser();
//              //    xmlDoc=parser.parseFromString(result.content,"text/xml");
//              //  }
//              //  else // Internet Explorer
//              //  {
//              //    xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
//              //    xmlDoc.async=false;
//              //    xmlDoc.loadXML(result.content);
//              //  }
//              //  var task = {};
//              //  debugger;
//              //  task.id =xmlDoc.getElementsByTagName('task')[0].getAttribute('id');
//              //  task.estimatedTime = parseInt(xmlDoc.getElementsByTagName('task')[0].getAttribute('estimatedProcessingTime'));
//              //  var totalTime = 0;
//              //  var interval =  window.setInterval(function () {
//              //    debugger;
//              //    HTTP.get('http://cloud.ocrsdk.com/getTaskStatus/?taskId=' + task.id, {headers: {Authorization: 'Basic: ' + cb.encoded}}, function (err, r) {
//              //      if(r){
//              //        if (window.DOMParser)
//              //        {
//              //          parser=new DOMParser();
//              //          xmlDoc=parser.parseFromString(r.content,"text/xml");
//              //        }
//              //        else // Internet Explorer
//              //        {
//              //          xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
//              //          xmlDoc.async=false;
//              //          xmlDoc.loadXML(r.content);
//              //        }
//              //        task.status =xmlDoc.getElementsByTagName('task')[0].getAttribute('status');
//              //        task.resultUrl =xmlDoc.getElementsByTagName('task')[0].getAttribute('resultUrl');
//              //        totalTime = totalTime + task.estimatedTime * 1000;
//              //        debugger;
//              //        if((task.status === 'Completed')||(totalTime > 20000)){
//              //          window.clearTimeout(interval);
//              //          HTTP.get(task.resultUrl, function(err, resultado){
//              //            if(resultado) {
//              //              if (window.DOMParser) {
//              //                parser = new DOMParser();
//              //                xmlDoc = parser.parseFromString(resultado.content, "text/xml");
//              //              }
//              //              else // Internet Explorer
//              //              {
//              //                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
//              //                xmlDoc.async = false;
//              //                xmlDoc.loadXML(resultado.content);
//              //              }
//              //              //create employee
//              //              var employee = {};
//              //              employee.objNameArray = ['person', 'Employee', 'contactable'];
//              //              employee.person = {
//              //                firstName: '',
//              //                middleName: '',
//              //                lastName: ''
//              //              };
//              //              employee.Employee = {};
//              //              employee.contactMethods = [];
//              //              var fields = xmlDoc.getElementsByTagName('field');
//              //              console.log('fields', fields);
//              //              _.forEach(fields, function(f){
//              //                switch(f.getAttribute('type')){
//              //                  case 'Phone':
//              //                  {
//              //
//              //                    break;
//              //                  }
//              //
//              //                }
//              //              })
//              //
//              //
//              //
//              //            }
//              //          })
//              //        };
//              //      }
//              //    });
//              //
//              //  }, task.estimatedTime * 1000);
//              //
//              //
//              //  //debugger;
//              //
//              //
//              //});
//            }
//          else{
//              console.log('else');
//          }
//            //connection.close();
//       //})      )
//
//          break;
//
//        default:
//          response.error('Method not supported');
//      }
//
//      //connection.close();
//    }
//  })
//})