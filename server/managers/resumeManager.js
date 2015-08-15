var stream = Meteor.npmRequire('stream');
var fs = Meteor.npmRequire('fs');

ResumeManager = {
  parse: function (data) {
    var form = new FormData();
    // handle a path
    if (_.isString(data)){
      var stream = fs.createReadStream(data);
      form.append("file", stream);
    }
    if (data.fileData) {
      var fileData = new Buffer(data.fileData, 'base64');
      form.append("file", fileData, {
        filename: 'aa.pdf',
        contentType: data.contentType
      });
    }
    else {
      //if data is readable stream , then use it as is on append, as it will get the filename and content type from the stream itself.
      form.append("file", data);
    }

    var headers = _.extend(form.getHeaders(), {
      'Accept-Encoding': 'gzip,deflate',
      'Accept': 'application/json',
      'passcode': ExartuConfig.ResumeParserPasscode
    });

    var response = Meteor.wrapAsync(form.submitWithTrailingCRLF, form)({
      host: ExartuConfig.ResumeParserURL,
      path: "/api/Parser/Parse",
      headers: headers
    });

    var result = "";

    //response.setEncoding('utf8');
    response.on('data', function (chunk) {
      result += chunk;
    });

    var err = Meteor.wrapAsync(response.on, response)('end');
    if (err) return err;

    try {
      var json = JSON.parse(result);
      var object = xml2jsAsync(json);
      return extractInformation(object);
    } catch (e) {
      return new Meteor.Error(500, "Error parsing resume");
    }
  },
  extractInformation: function (information) {
    return extractInformation(information);
  }
};

var xml2jsAsync = function (json) {
  var result = Meteor.wrapAsync(xml2js.parseString)(json);
  if (!result || !result.StructuredXMLResume)
    return new Meteor.Error(500, "Error parsing resume");
  else
    return result;
};

var extractInformation = function (parseResult) {
    var employee = {};
    employee.objNameArray = ['person', 'Employee', 'contactable'];
    employee.person = {
      firstName: '',
      middleName: '',
      lastName: ''
    };
    employee.Employee = {};

    //active and process status
    try {
      var activeStatus = LookUps.findOne({
        hierId: Meteor.user().currentHierId,
        lookUpCode: Enums.lookUpCodes.active_status,
        isDefault: true
      });
      if (!activeStatus) {
        activeStatus = LookUps.findOne({
          hierId: Meteor.user().currentHierId,
          lookUpCode: Enums.lookUpCodes.active_status,
          lookUpActions: Enums.lookUpAction.Implies_Active
        });
      }
      var processStatus = LookUps.findOne({
        hierId: Meteor.user().currentHierId,
        lookUpCode: Enums.lookUpCodes.employee_status,
        isDefault: true
      });
      if (!processStatus) {
        processStatus = LookUps.findOne({
          hierId: Meteor.user().currentHierId,
          lookUpCode: Enums.lookUpCodes.employee_status
        });
      }
      employee.activeStatus = activeStatus._id;
      employee.Employee.status = processStatus._id;
    } catch (e) {
      console.log(e);
    }


    var structuredResult = parseResult.StructuredXMLResume;

    //ContactInfo

    try {
      var ContactInfo = parseResult.StructuredXMLResume.ContactInfo[0];
      employee.contactMethods = [];
      if (ContactInfo && ContactInfo && ContactInfo.ContactMethod) {
        var contactMethod = ContactInfo.ContactMethod;
        var phoneTypeId = LookUpManager.ContactMethodTypes_MobilePhone()._id;
        var emailTypeId = LookUpManager.ContactMethodTypes_Email()._id;
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

          if (cm.InternetEmailAddress)
            employee.contactMethods.push({
              type: emailTypeId,
              value: cm.InternetEmailAddress[0]
            });


          if (cm.PostalAddress) {
            var loc = cm.PostalAddress[0];
            employee.location = {
              country: loc.CountryCode ? loc.CountryCode[0] : '',
              address: (loc.DeliveryAddress && loc.DeliveryAddress[0].AddressLine) ? loc.DeliveryAddress[0].AddressLine[0] : '',
              postalCode: loc.PostalCode ? loc.PostalCode[0] : ''
            };
          }

          //});
        });
      }
    }
    catch (err) {
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
              employee.tags = _.uniq(employee.tags.push(q.$.name));
          })
        })
      }
    } catch (err) {
      console.log('Error while parsing tags');
      console.log(err)
    }

    // Education
    var educations = [];
    try {
      if (structuredResult.EducationHistory) {
        _.each(structuredResult.EducationHistory[0].SchoolOrInstitution, function (schoolOrInstitution) {

          var schoolName = schoolOrInstitution.School ? schoolOrInstitution.School[0].SchoolName[0] : '';

          var degree = schoolOrInstitution.Degree[0];

          var description = degree.Comments[0];

          if (degree.DatesOfAttendance) {
            var dates = degree.DatesOfAttendance[0];

            var startDate = dates.StartDate[0].AnyDate[0];
            startDate = new Date(startDate);

            var endDate = dates.EndDate[0].AnyDate[0];
            endDate = new Date(endDate);

            if (_.isNaN(startDate.getDate())) {
              startDate = null;
            }
            if (_.isNaN(endDate.getDate())) {
              endDate = null;
            }
          } else {
            var startDate = null;
            var endDate = null;
          }


          //var degreeDate = degree.DegreeDate[0].AnyDate[0];
          //degreeDate = new Date(degreeDate);

          var degreeAwarded = (degree.DegreeName && degree.DegreeName[0]) || (degree.DegreeMajor && degree.DegreeMajor[0].Name[0]) || '';


          educations.push({
            institution: schoolName,
            description: description,
            degreeAwarded: degreeAwarded,
            start: startDate,
            end: endDate
          })

        });

      }
    } catch (err) {
      console.log('Error while parsing educations');
      console.log(err);
    }
    employee.education = educations;

    // Past jobs
    var pastJobs = [];
    try {
      if (structuredResult.EmploymentHistory) {
        _.each(structuredResult.EmploymentHistory[0].EmployerOrg, function (employerOrg) {
          var employerName = employerOrg.EmployerOrgName && employerOrg.EmployerOrgName[0];

          _.each(employerOrg.PositionHistory, function (position) {

            var endDate = position.EndDate[0].AnyDate[0];
            endDate = new Date(endDate);
            if (_.isNaN(endDate.getDate())) {
              endDate = null;
            }

            var startDate = position.StartDate[0].AnyDate[0];
            startDate = new Date(startDate);
            if (_.isNaN(startDate.getDate())) {
              startDate = null;
            }

            var description = position.Description && position.Description[0];

            var title = position.Title && position.Title[0];

            pastJobs.push({
              id: Random.id(),
              company: employerName,
              position: title,
              duties: description,
              start: startDate,
              end: endDate,
              dateCreated: new Date()
            })
          });

        });

      }
    } catch (err) {
      console.log('Error while parsing pastJobs');
      console.log(err);
    }
    employee.pastJobs = pastJobs;

    return employee;
  };


Meteor.methods({
  resumeParserMethod: function(data){
    var employeeId = ContactableManager.createFromResume(data);

    if (employeeId) {
      var bufferStream = new stream.PassThrough();
      // Write your buffer
      bufferStream.end(new Buffer(data.fileData, 'base64'));

      try {
        var resumeId = S3Storage.upload(bufferStream);
      } catch (e) {
        console.log("Problem with S3Storage", e)
      }

      if (!resumeId) {
        console.log("Error uploading resume to S3");
      }
      var resume = {
        employeeId: employeeId,
        resumeId: resumeId,
        userId: Meteor.userId(),
        hierId: Meteor.user().currentHierId,
        name: data.fileName,
        type: data.contentType,
        extension: data.extension,
        dateCreated: new Date()
      };

      Resumes.insert(resume);
    }

    return employeeId;
  }
})

