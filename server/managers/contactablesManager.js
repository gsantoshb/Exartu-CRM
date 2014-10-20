
ContactableManager = {
  create: function (contactable) {
    return Contactables.insert(contactable);
  },

  createFromResume: function (resumeId) {
    var fsFile = ResumesFS.findOne({_id: resumeId});
    //var fsFile = new FS.File(file);

    var tempEmployee = {};
    tempEmployee.objNameArray = ['person', 'Employee', 'contactable'];
    tempEmployee.person = {
      firstName: '',
      middleName: '',
      lastName: ''
    };
    tempEmployee.Employee = {};

    var syncParse = Meteor.wrapAsync(
      Meteor.bindEnvironment(function (resumeFileId, f, cb) {
          f.once('stored', Meteor.bindEnvironment(function () {
              var stream = fsFile.createReadStream('contactablesFS');
              var form = new FormData();
              form.append("file", stream);
              form.submit({
                  host: "xr2demo.tempworks.com",
                  path: "/resumeparser/api/Parser/Parse",
                  headers: _.extend(form.getHeaders(), {
                    'Accept-Encoding': 'gzip,deflate',
                    'Accept': 'application/json'
                  })
                },
                Meteor.bindEnvironment(function (err, res) {
                  var body = "";
                  res.setEncoding('utf8');
                  res.on('data', function (chunk) {
                    body += chunk;
                  })
                    .on('end', Meteor.bindEnvironment(function () {
                      try {
                        var json = JSON.parse(body);
                      } catch (e) {
                        cb(new Meteor.Error(500, "Error parsing resume"), null);
                        return;
                      }
                      xml2js.parseString(json, Meteor.bindEnvironment(function (err, result) {
                        if (err || !result || !result.StructuredXMLResume) {
                          cb(new Meteor.Error(500, "Error parsing resume"), null);
                          return;
                        }

                        extractInformation(result, tempEmployee);

                        var employee = ContactableManager.create(tempEmployee);
                        if (result) {
                          ResumesFS.update({_id: resumeFileId}, {
                            $set: {
                              'metadata.completed': true,
                              'metadata.employeeId': employee
                            }
                          });

                          cb(null, tempEmployee);
                        } else
                          cb(new Meteor.Error(500, "Error during employee creating"), null);
                      }));
                    }));
                  res.resume();
                }));
            }
          ));
        }
      )
    );

    return syncParse(resumeId, fsFile);
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
          // Generate a temp Employee to insert
          var tempEmployee = {};
          tempEmployee.objNameArray = ['person', 'Employee', 'contactable'];
          tempEmployee.person = {
            firstName: '',
            middleName: '',
            lastName: ''
          };
          tempEmployee.Employee = {};

          // Parse the result
          var json = EJSON.parse(result.content);
          xml2js.parseString(json, Meteor.bindEnvironment(function (error, result) {
            if (error)
              future.throw(error);
            else {

              // Create new Employee
              extractInformation(result, tempEmployee);
              var employeeId = ContactableManager.create(tempEmployee);
              future.return(employeeId);
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
  }
};

var extractInformation = function (parseResult, employee) {
//var example = {
//  StructuredXMLResume: {
//    ContactInfo: [
//      {
//        ContactMethod: [
//          {
//            Telephone: [
//              {
//                FormattedNumber: [
//                  '555-5555-555'
//                ]
//              }
//            ]
//          },
//          {
//            InternetEmailAddress: ['asd@asd.asd'],
//            Location: ['onPerson'],
//            Use: ['personal'],
//            WhenAvailable: ['anytime']
//          },
//          {
//            PostalAddress: [{
//              $: { type: "undefined" },
//              CountryCode: ['CA'],
//              DeliveryAddress: [{ AddressLine: ['"1A Software Engineering"'] }],
//              Municipality: ['University of Waterland ID: 20202020↵↵Permanent Address:↵100 Fake St.↵Waterland'],
//              PostalCode: [''],
//              Region: ['On']
//            }],
//            WhenAvailable: Array[1]
//          }
//        ]
//      }
//    ],
//    PersonName: [
//      {
//        FamilyName: [''],
//        FormattedName: [''],
//        GivenName: [''],
//        MiddleName: ['']
//      }
//    ],
//    EducationHistory: [
//      {
//        $: {schoolType: "highschool"},
//        Degree: [
//          {
//            $: {degreeType: "high school or equivalent"},
//            Comments: [''],
//            DatesOfAttendance: [
//              {
//                EndDate: [
//                  {
//                    AnyDate: ['YYY-MM-DD']
//                  }
//                ],
//                StartDate: [
//                  {AnyDate: []}
//                ]
//              }
//            ],
//            DegreeDate: [
//              {AnyDate: []}
//            ],
//            DegreeName: ['Diploma'],
//            UserArea: [
//              {
//                'sov:DegreeUserArea': [
//                  {
//                    'sov:Id': ['DEG-1']
//                  }
//                ]
//              }
//            ]
//          }
//        ],
//        PostalAddress: Array[1],
//        School: [
//          {SchoolName: ['']}
//        ]
//      }
//    ],
//    EmploymentHistory: Array[1],
//    LicensesAndCertifications: Array[1],
//    Objective: [''],
//    Qualifications: [
//      {
//        Competency: {
//          $: {name: "TRAINING"},
//          CompetencyEvidence: Array[1],
//          CompetencyId: Array[1],
//          TaxonomyId: Array[1]
//        }
//      }
//    ],
//    References: Array[1],
//    RevisionDate: Array[1]
//  }
//};

  var structuredResult = parseResult.StructuredXMLResume;

  //ContactInfo
  try {
    var ContactInfo = parseResult.StructuredXMLResume.ContactInfo[0];

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
          var loc = cm.PostalAddress[0];
          employee.location = {
            country: loc.CountryCode ? loc.CountryCode[0] : '',
            address: (loc.DeliveryAddress && loc.DeliveryAddress[0].AddressLine) ? loc.DeliveryAddress[0].AddressLine[0] : '',
            postalCode: loc.PostalCode ? loc.PostalCode[0] : ''
          };
        }
      });
    }
  } catch (err) {
    console.log('Error while parsing ContactInfo');
    console.log(err)
  }

  // Person names
  try {
    if (ContactInfo.PersonName && ContactInfo.PersonName[0]) {
      var personName = ContactInfo.PersonName[0];
      employee.person = {};
      employee.person.firstName = personName.GivenName ? personName.GivenName.join(' ') : 'GivenName';
      employee.person.middleName = personName.MiddleName ? personName.MiddleName.join(' ') : '';
      employee.person.lastName = personName.FamilyName ? personName.FamilyName.join(' ') : 'FamilyName';
    } else {
      employee.person.firstName = 'Parsed'
      employee.person.lastName = 'Employee'
    }
  } catch (err) {
    console.log('Error while parsing person names');
    console.log(err)
  }

  // Tags
  try {
    employee.tags = [];
    if (structuredResult.Qualifications) {
      _.each(structuredResult.Qualifications, function (qual) {
        _.each(qual.Competency, function (q) {
          if (q.$ && q.$.name)
            employee.tags.push(q.$.name);
        })
      })
    }
  } catch (err) {
    console.log('Error while parsing tags');
    console.log(err)
  }
};
