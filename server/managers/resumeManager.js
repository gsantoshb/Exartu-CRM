ResumeManager = {
  parse: function (data) {
    if (typeof data.read == 'function') {
      var form = new FormData();
      form.append("file", data);

      var headers = _.extend(form.getHeaders(), {
        'Accept-Encoding': 'gzip,deflate',
        'Accept': 'application/json'
      });

      var response = Meteor.wrapAsync(form.submit, form)({
        host: "xr2demo.tempworks.com",
        path: "/resumeparser/api/Parser/Parse",
        headers: headers
      });

      var result = "";

      //response.setEncoding('utf8');
      response.on('data', function (chunk) {
        result += chunk;
      });

      var err = Meteor.wrapAsync(response.on, response)('end');
      if (err) return err;
    } else if (data instanceof String) {
      // TODO: parse string
    }

    try {
      var json = JSON.parse(result);
      var object = xml2jsAsync(json);
      return extractInformation(object);
    } catch (e) {
      return new Meteor.Error(500, "Error parsing resume");
    }
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
  var employee = {};
  employee.objNameArray = ['person', 'Employee', 'contactable'];
  employee.person = {
    firstName: '',
    middleName: '',
    lastName: ''
  };
  employee.Employee = {};

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
  ;

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
  ;

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
  };

  // educations
  var educations = [];
  try{
    if (structuredResult.EducationHistory){
      _.each(structuredResult.EducationHistory[0].SchoolOrInstitution, function (schoolOrInstitution) {

        var schoolName = schoolOrInstitution.School ? schoolOrInstitution.School[0].SchoolName[0] : '';

        var degree = schoolOrInstitution.Degree[0];

        var description = degree.Comments[0];

        if ( degree.DatesOfAttendance){
          var dates = degree.DatesOfAttendance[0];

          var startDate = dates.StartDate[0].AnyDate[0];
          startDate = new Date(startDate);

          var endDate = dates.EndDate[0].AnyDate[0];
          endDate = new Date(endDate);

          if (_.isNaN(startDate.getDate())){
            startDate = null;
          }
          if (_.isNaN(endDate.getDate())){
            endDate = null;
          }
        }else{
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
  } catch (err){
    console.log('Error while parsing educations');
    console.log(err);
  }
  employee.education = educations;

  //past jobs
  var pastJobs = [];
  try{
    debugger;
    if (structuredResult.EmploymentHistory){
      _.each(structuredResult.EmploymentHistory[0].EmployerOrg, function (employerOrg) {
        var employerName = employerOrg.EmployerOrgName && employerOrg.EmployerOrgName[0];

        _.each(employerOrg.PositionHistory, function (position) {

          var endDate = position.EndDate[0].AnyDate[0];
          endDate = new Date(endDate);
          if (_.isNaN(endDate.getDate())){
            endDate = null;
          }

          var startDate = position.StartDate[0].AnyDate[0];
          startDate = new Date(startDate);
          if (_.isNaN(startDate.getDate())){
            startDate = null;
          }

          var description = position.Description && position.Description[0];

          var title = position.Title && position.Title[0];

          pastJobs.push({
            company: employerName,
            position: title,
            duties: description,
            start: startDate,
            end: endDate
          })
        });

      });

    }
  } catch (err){
    console.log('Error while parsing pastJobs');
    console.log(err);
  }
  employee.pastJobs = pastJobs;

  return employee;
};