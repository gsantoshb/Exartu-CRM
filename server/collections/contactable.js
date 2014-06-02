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
  var user = Meteor.user();
  doc.hierId = user.hierId;
  doc.userId = user._id;
  doc.createdAt = Date.now();

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
  return ResumesFS.find({'metadata.owner': Meteor.userId});
});

ResumesFS.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function() {
    return true;
  }
});

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
    createEmployeeFromResume: function(resumeFileId) {
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
                    var json = JSON.parse(body);
                    //console.log(json);
                    xml2js.parseString(json, Meteor.bindEnvironment(function (err, result) {
                      if (err || !result || !result.StructuredXMLResume) {
                        cb(new Meteor.Error(500, "Error parsing resume"), null);
                        return;
                      }

                      if (result.StructuredXMLResume.ContactInfo && result.StructuredXMLResume.ContactInfo[0].PersonName) {
                        var personName = result.StructuredXMLResume.ContactInfo[0].PersonName[0];
                        tempEmployee.person = {};
                        if (personName.GivenName)
                          tempEmployee.person.firstName = personName.GivenName[0];
                        if (personName.MiddleName)
                          tempEmployee.person.middleName = personName.MiddleName[0];

                        if (personName.FamilyName)
                          tempEmployee.person.lastName = personName.FamilyName[0];
                      }

                      Meteor.call('addContactable', tempEmployee, function(err, result) {
                        if (!err) {
                          ResumesFS.update({_id: resumeFileId}, {
                            $set: {
                              'metadata.completed' : true,
                              'metadata.employeeId' : result
                            }
                          });
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
    addContactablePost: function (contactableId, post) {
      // TODO: validations
      post.userId = Meteor.userId();
      post.createdAt = Date.now();

      console.log('New post ');
      console.dir(post);

      Contactables.update({
        _id: contactableId
      }, {
        $addToSet: {
          posts: post
        }
      });
    },
    updateContactablePicture: function (contactableId, fileId) {
      console.log("contactalbe picture updated");
      Contactables.update({
        _id: contactableId
      }, {
        $set: {
          pictureFileId: fileId
        }
      });
        },
        createCandidate: function(candidate, jobId) {
          candidate.cratedAt = new Date();
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
    throw new Meteor.Error(401, "Please login");

  if (!contactable.objNameArray || !contactable.objNameArray.length) {
    console.error('the contactable must have at least one objName');
    throw new Meteor.Error(401, "invalid contactable");
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