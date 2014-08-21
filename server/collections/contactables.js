Meteor.publish('contactables', function () {
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;

  return Contactables.find({
    $or: filterByHiers(user.hierId)
  });
});

Contactables.allow({
  insert: function (userId, doc) {
    return false;
  },
  update: function (userId, doc, fields, modifier) {
    console.log('update contacatable: ' + methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId));
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
  },
  remove: function (userId, doc) {
    return false;
  }
})

Contactables.before.insert(function (userId, doc) {
  try{
    var user = Meteor.user() || {};
  }catch (e){
    //when the insert is trigger from the server
    var user= { }
  }
  doc.hierId = user.hierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.require('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

// Contactables files
ContactablesFS = new Document.Collection({
  collection: Contactables
});
ContactablesFS.publish(); // Default publish and allow options

ResumesFS = new FS.Collection("resumes", {
  stores: [new FS.Store.FileSystem("resumes", {path: "~/resumes"})]
});

Meteor.publish('resumes', function() {
  return ResumesFS.find({'metadata.owner': this.userId});
});

ResumesFS.allow({
  insert: function (userId, file) {
    return true;
  },
  update: function (userId, file, fields, modifier) {
    return true;
  },
  remove: function (userId, file) {
    return true;
  },
  download: function (userId, file) {
    return true;
  }
});

var extractInformation = function(parseResult, employee) {
//                          var example = {
//                            StructuredXMLResume: {
//                              ContactInfo: [
//                                {
//                                  ContactMethod: [
//                                    {
//                                      Telephone: [
//                                        {
//                                          FormattedNumber: [
//                                            '555-5555-555'
//                                          ]
//                                        }
//                                      ]
//                                    },
//                                    {
//                                      InternetEmailAddress: ['asd@asd.asd'],
//                                      Location: ['onPerson'],
//                                      Use: ['personal'],
//                                      WhenAvailable: ['anytime']
//                                    },
//                                    {
//                                      PostalAddress: [{
//                                        $: { type: "undefined" },
//                                        CountryCode: ['CA'],
//                                        DeliveryAddress: [{ AddressLine: ['"1A Software Engineering"'] }],
//                                        Municipality: ['University of Waterland ID: 20202020↵↵Permanent Address:↵100 Fake St.↵Waterland'],
//                                        PostalCode: [''],
//                                        Region: ['On']
//                                      }],
//                                      WhenAvailable: Array[1]
//                                    }
//                                  ]
//                                }
//                              ],
//                              PersonName: [
//                                {
//                                  FamilyName: [''],
//                                  FormattedName: [''],
//                                  GivenName: [''],
//                                  MiddleName: ['']
//                                }
//                              ],
//                              EducationHistory: [
//                                {
//                                  $: {schoolType: "highschool"},
//                                  Degree: [
//                                    {
//                                      $: {degreeType: "high school or equivalent"},
//                                      Comments: [''],
//                                      DatesOfAttendance: [
//                                        {
//                                          EndDate: [
//                                            {
//                                              AnyDate: ['YYY-MM-DD']
//                                            }
//                                          ],
//                                          StartDate: [
//                                            {AnyDate: []}
//                                          ]
//                                        }
//                                      ],
//                                      DegreeDate: [
//                                        {AnyDate: []}
//                                      ],
//                                      DegreeName: ['Diploma'],
//                                      UserArea: [
//                                        {
//                                          'sov:DegreeUserArea': [
//                                            {
//                                              'sov:Id': ['DEG-1']
//                                            }
//                                          ]
//                                        }
//                                      ]
//                                    }
//                                  ],
//                                  PostalAddress: Array[1],
//                                  School: [
//                                    {SchoolName: ['']}
//                                  ]
//                                }
//                              ],
//                              EmploymentHistory: Array[1],
//                              LicensesAndCertifications: Array[1],
//                              Objective: [''],
//                              Qualifications: [
//                                {
//                                  Competency: {
//                                    $: {name: "TRAINING"},
//                                    CompetencyEvidence: Array[1],
//                                    CompetencyId: Array[1],
//                                    TaxonomyId: Array[1]
//                                  }
//                                }
//                              ],
//                              References: Array[1],
//                              RevisionDate: Array[1]
//                            }
//                          };

  var structuredResult = parseResult.StructuredXMLResume;
  var ContactInfo = parseResult.StructuredXMLResume.ContactInfo[0];


  //ContactInfo
  try{
    employee.contactMethods = [];
    if (ContactInfo && ContactInfo && ContactInfo.ContactMethod) {
      var contactMethod = ContactInfo.ContactMethod;

      var phoneTypeId = ContactMethods.findOne({type: Enums.contactMethodTypes.phone})._id;
      var emailTypeId = ContactMethods.findOne({type: Enums.contactMethodTypes.email})._id;
      _.each(contactMethod, function (cm) {


        if (cm.Telephone)
          _.each(cm.Telephone, function (telephone) {
            employee.contactMethods.push({
              type: phoneTypeId,
              value: telephone.FormattedNumber[0]
            })
          });

        if (cm.Mobile)
          _.each(cm.Mobile, function (telephone) {
            employee.contactMethods.push({
              type: phoneTypeId,
              value: telephone.FormattedNumber[0]
            })
          });

        if (cm.InternetEmailAddress) {
          employee.contactMethods.push({
            type: emailTypeId,
            value: cm.InternetEmailAddress[0]
          });
        }
        if (cm.PostalAddress) {
          var loc=cm.PostalAddress[0];
          employee.location= {
            country: loc.CountryCode ? loc.CountryCode[0]: '',
            address: (loc.DeliveryAddress && loc.DeliveryAddress[0].AddressLine) ? loc.DeliveryAddress[0].AddressLine[0]: '',
            postalCode: loc.PostalCode ? loc.PostalCode[0]: ''
          };
        }
      });
    }
  }catch (err){
    console.log('Error while parsing ContactInfo');
    console.log(err)
  };

  //person names
  try{
    if (ContactInfo.PersonName && ContactInfo.PersonName[0]) {
      var personName = ContactInfo.PersonName[0];
      employee.person.firstName = personName.GivenName ? personName.GivenName.join(' '): 'GivenName';
      employee.person.middleName = personName.MiddleName ? personName.MiddleName.join(' ') : '';
      employee.person.lastName = personName.FamilyName ? personName.FamilyName.join(' '): 'FamilyName';
    }else{
      employee.person.firstName = 'Parsed'
      employee.person.lastName = 'Employee'
    }
  }catch (err){
    console.log('Error while parsing person names');
    console.log(err)
  };

  //tags
  try{
    employee.tags=[];
    if (structuredResult.Qualifications){
      _.each(structuredResult.Qualifications, function(qual){
        _.each(qual.Competency, function(q){
          if (q.$ && q.$.name)
            employee.tags.push(q.$.name);
        })
      })
    }
  }catch (err){
    console.log('Error while parsing tags');
    console.log(err)
  };

}


Meteor.startup(function () {
  Meteor.methods({
    addContactable: function (contactable) {
      return Contactables.insert(contactable);
    },
    updateContactable: function (contactable) {
      if (beforeInsertOrUpdateContactable(contactable)) {
        Contactables.update({
          _id: contactable._id
        }, contactable);
      } else {
        console.error('Contactable not valid')
        console.dir(contactable);
      }
    },
    createEmployeeFromResume: //SubscriptionPlan.checkFunction([SubscriptionPlan.plansEnum.enterprise],
      function(resumeFileId) {
        FS.debug = true;

        var file = ResumesFS.findOne({_id: resumeFileId});
        var fsFile = new FS.File(file);
        var stream = fsFile.createReadStream('contactablesFS');
        var form = new FormData();

        var tempEmployee = {};
        tempEmployee.objNameArray = ['person', 'Employee', 'contactable'];
        tempEmployee.person = {
          firstName: '',
          middleName: '',
          lastName: ''
        };
        tempEmployee.Employee = {};

        var syncParse = Meteor._wrapAsync(
          Meteor.bindEnvironment(function(stream, resumeFileId, cb) {
              form.append("file", stream);
              form.submit(
                {
                  host: "xr2demo.tempworks.com",
                  path: "/resumeparser/api/Parser/Parse",
                  headers: _.extend(form.getHeaders(), {
                    'Accept-Encoding': 'gzip,deflate',
                    'Accept': 'application/json'
                  })
                },
                Meteor.bindEnvironment(function(err, res){
                  var body = "";
                  res.setEncoding('utf8');
                  res.on('data', function (chunk) {
                    body += chunk;
                  })
                    .on('end', Meteor.bindEnvironment(function () {
                      try{
                        var json = JSON.parse(body);
                      }catch (e){
                        cb(new Meteor.Error(500, "Error parsing resume"), null);
                      }
                      //console.log(json);
                      xml2js.parseString(json, Meteor.bindEnvironment(function (err, result) {


                        if (err || !result || !result.StructuredXMLResume) {
                          cb(new Meteor.Error(500, "Error parsing resume"), null);
                          return;
                        }


                        extractInformation(result, tempEmployee)

                        Meteor.call('addContactable', tempEmployee, function(err, result) {
                          if (!err) {
                            ResumesFS.update({_id: resumeFileId}, {
                              $set: {
                                'metadata.completed' : true,
                                'metadata.employeeId' : result
                              }
                            });
//                            ContactablesFS.insert()
                            cb(null, tempEmployee);
                          }else
                            cb(new Meteor.Error(500, "Error during employee creating"), null);
                        });
                      }));
                    }));
                }
              ));
          }
        ));

        return syncParse(stream, resumeFileId);
      },
//    ),
    addContactableTag: function (contactableId, tag) {
      // TODO: validations

      Contactables.update({
        _id: contactableId
      }, {
        $addToSet: {
          tags: tag
        }
      });
    },
    removeContactableTag: function (contactableId, tag) {
      // TODO: validations

      Contactables.update({
        _id: contactableId
      }, {
        $pull: {
          "tags": tag
        }
      });
    },
    addContactableContactMethod: function (contactableId, contactMethod) {
      // TODO: validations

      Contactables.update({
        _id: contactableId
      }, {
        $addToSet: {
          contactMethods: contactMethod
        }
      });
    },
//    addContactablePost: function (contactableId, post) {
//      // TODO: validations
//      post.userId = Meteor.userId();
//      note.dateCreated = Date.now()
//
//      console.log('New post ');
//      console.dir(post);
//
//      Contactables.update({
//        _id: contactableId
//      }, {
//        $addToSet: {
//          posts: post
//        }
//      });
//    },
    updateContactablePicture: function (contactableId, fileId) {
      console.log("contact picture updated");
      Contactables.update({
        _id: contactableId
      }, {
        $set: {
          pictureFileId: fileId
        }
      });
        },
        createCandidate: function(candidate, jobId) {
          candidate.dateCreated = new Date();
          candidate.negotiation = '';
          Jobs.update({
            _id: jobId
          }, {
            $addToSet: {
              candidates: candidate
            }
          });
    }
  });
});

/*
 * logic that is common to add and update a contactable (extend and validate)
 */
var beforeInsertOrUpdateContactable = function (contactable) {
  var user = Meteor.user();
  if (user == null && !Meteor.settings.demo)
    throw new Meteor.Error(401, "Please sign in");

  if (!contactable.objNameArray || !contactable.objNameArray.length) {
    console.error('the contact must have at least one objName');
    throw new Meteor.Error(401, "invalid contact");
  }
  var objTypes = ObjTypes.find({
    objName: {
      $in: contactable.objNameArray
    }
  }).fetch();

  if (objTypes.length != contactable.objNameArray.length) {
    console.error('the contactable objNameArray is suspicious');
    console.dir(contactable.objNameArray);
    throw new Meteor.Error(401, "invalid objNameArray");
  }
  extendContactable(contactable, objTypes)

  return Validate(contactable, objTypes)
}
/*
 * extend the contactable object with the contact methods and the services needed
 * objTypes must be an array with the object's types that the contactable references
 */
var extendContactable = function (contactable, objTypes) {
  if (!contactable.contactMethods)
    contactable.contactMethods = [];

  _.forEach(objTypes, function (objType) {
    if (objType) {
      _.forEach(objType.services, function (service) {
        if (contactable[service] == undefined)
          contactable[service] = [];
      });
    }
  });
  if (!contactable._id){    //is inserting
      contactable._id= Meteor.uuid();
  }
};

/*
 * validate that the contactable is valid for the objTypes passed
 * objTypes must be an array with the object's types that the contactable references
 */
var Validate = function (contactable, objTypes) {

  if (!validateContactable(contactable)) {
    return false;
  }
  var v = true;
  _.every(objTypes, function (objType) {
    v = v && validateObjType(contactable, objType);
    return v;
  });
  return v;
};

/*
 * validate that the contactable is a valid person or a valid org
 */
var validateContactable = function (obj) {
  if (!obj.person & !obj.organization) {
    console.error('the contactable must be a person or an organization');
    return false
  }
  if (obj.person && (!validatePerson(obj.person))) {
    console.error('invalid person');
    return false;
  }
  if (obj.organization && (!validateOrganization(obj.organization))) {
    console.error('invalid Organization');
    return false;
  }
  return true;
};

var validatePerson = function (person) {
  if (!person.firstName)
    return false;
  if (!person.lastName)
    return false;
  return true;
};

var validateOrganization = function (org) {
  if (!org.organizationName)
    return false;
  return true;
}

// indexes
Contactables._ensureIndex({hierId: 1});
Contactables._ensureIndex({objNameArray: 1});