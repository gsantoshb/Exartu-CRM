var streamBuffers = Meteor.npmRequire("stream-buffers");

//todo hack
var applicantCenterURL = process.env.HRCENTER_URL || 'http://localhost:3030/';

HRConcourseManager = {
  sendInvitation: function(employeeId, email){
    console.log('sending invitation..');

    var employee= Contactables.findOne({ _id: employeeId });
    if (! employee){
      throw new Meteor.Error(500,'employee not found')
    }

    if (employee.user){
      throw new Meteor.Error(400,'employee already registered')
    }

    if (!email) {
      var contactMethodsTypes = LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode }).fetch();

      var contactMethod = _.find(employee.contactMethods, function (cm) {
        var type = _.findWhere(contactMethodsTypes, { _id: cm.type });
        if (type && type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email))
          return true;
      });

      email= contactMethod ? contactMethod.value: false;
    }

    if (! helper.emailRE.test(email)){
      throw new Meteor.Error(500,'invalid email')
    }

    var token= KeyToken.createToken(employee.hierId, {employee: employeeId});

    var html='<h2>Welcome to ApplicantCenter</h2>' +
      '<a href="' + applicantCenterURL + 'register/' + employee.hierId + '/' + token + '">Join</a>'

    if (employee.invitation){
      KeyToken.invalidate(employee.invitation);
    }

    Meteor.call('sendEmail', email ,'TempWorks - Invitation', html, true, function(err, result){
      if(!err){
        //setEmployee as invited
        Contactables.update({ _id: employeeId}, { $set: { invitation: token } });
      }else{
        console.err('error sending invitation email')
        console.dir(err)
      }
    });

  },
  createContactableFromUser: function(userId){
    //todo: validate appCenter server

    var user = Meteor.users.findOne(userId);
    if (!user){
      throw new Meteor.Error(400, 'User not found')
    }

    return Contactables.insert({
      objNameArray:['person', 'Employee', 'Contactable'],
      hierId: user.hierId,
      userId: user._id,
      user: user._id,
      person: {
        "firstName" : user.username || user.emails[0].address,
        "lastName" : user.username || user.emails[0].address
      },
      Employee:{

      }
    })
  },


  syncKioskEmployee: function (hierId, docCenterId) {
    // Validate empInfo
    if (!hierId) throw new Error("Hier ID is required");
    if (!docCenterId) throw new Error("DocCenter ID is required");

    // Log the attempt to sync an HRC employee
    var logRecordId = KioskEmployees.insert({docCenterId: docCenterId});

    var empEmail;
    var documentInstances = 0;
    var mergeFields = {};

    // Get the existing documents
    var instances = DocCenter.getDocumentInstances(hierId, docCenterId);
    _.each(instances, function (doc) {
      documentInstances++;

      // Set the email initially from the document instance
      empEmail = doc.email;

      // Get the merge field values for each document
      _.each(doc.mergeFieldValues, function (mf) {
        mergeFields[mf.key] = mf.value;
      });
    });

    // Log the amount of doc instances
    KioskEmployees.update({_id: logRecordId}, {$set: {documentInstances: documentInstances}});

    // Check at least one document is on the user
    if (!documentInstances) throw new Error('The specified user has no documents.');

    // Extract the information from the merge fields
    if (mergeFields.email) { empEmail = mergeFields.email; }
    var empFirstName = mergeFields.firstName || empEmail;
    var empLastName = mergeFields.lastName || empEmail;

    // Email contact method
    var hierFilter = Utils.filterByHiers(hierId);
    var emailCM = LookUps.findOne({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: Enums.lookUpAction.ContactMethod_Email,
      $or: hierFilter
    });

    // Create employee with DocCenter info on it
    var empId = Contactables.insert({
      objNameArray:['person', 'Employee', 'Contactable'],
      hierId: hierId,
      person: {
        "firstName" : empFirstName,
        "lastName" : empLastName,
      },
      contactMethods: [{type: emailCM._id, value: empEmail}],
      Employee: {},
      docCenter: {
        docCenterId: docCenterId,
      }
    });
    if (!empId) throw new Error('An error occurred while creating the employee');

    // Log the ID of the employee related to this HRC user
    KioskEmployees.update({_id: logRecordId}, {$set: {contactableId: empId}});

    // Add available information from the merge fields
    var update = {$set: {}};
    if (mergeFields.ssn) update.$set['Employee.taxID'] = mergeFields.ssn;
    if (mergeFields.dateOfBirth) update.$set['person.birthDate'] = mergeFields.dateOfBirth;
    if (mergeFields.convictions) update.$set['Employee.convictions'] = mergeFields.convictions;
    if (mergeFields.ethnicity) update.$set['Employee.ethnicity'] = mergeFields.ethnicity;
    if (mergeFields.desiredPay) update.$set['Employee.desiredPay'] = mergeFields.desiredPay;
    if (mergeFields.gender) {
      if (mergeFields.gender.indexOf('f') != -1 || mergeFields.gender.indexOf('F') != -1) {
        update.$set['Employee.gender'] = 'f';
      } else {
        update.$set['Employee.gender'] = 'm';
      }
    }
    if (mergeFields.hasOwnTransportation) {
      if (mergeFields.hasOwnTransportation.indexOf('t') != -1 || mergeFields.hasOwnTransportation.indexOf('T') != -1) {
        update.$set['Employee.hasTransportation'] = true;
      } else {
        update.$set['Employee.hasTransportation'] = false;
      }
    }

    // Update the employee with the information obtained from the merge fields
    if (!_.isEmpty(update.$set)) Contactables.update({_id: empId}, update);

    // Create an address for this employee when provided
    if (mergeFields.addressLine1 && mergeFields.city && mergeFields.country) {
      // Address type
      var addressType = LookUps.findOne({
        lookUpCode: Enums.lookUpTypes.linkedAddress.type.lookUpCode,
        $or: hierFilter
      });

      var address = {
        addressTypeId: addressType._id,
        linkId: empId,
        address: mergeFields.addressLine1,
        city: mergeFields.city,
        country: mergeFields.country
      };

      // Add optional fields
      if (mergeFields.addressLine2) address.address2 = mergeFields.addressLine2;
      if (mergeFields.state) address.state = mergeFields.state;
      if (mergeFields.zipCode) address.postalCode = mergeFields.zipCode;

      AddressManager.addEditAddress(address);
    }


    // Create AppCenter account for the employee
    var appCenterId = ApplicantCenterManager.createUserForHRCKioskEmployee(empId, empEmail);
    if (appCenterId) {
      // Log the ID of the AC user created for thi HRC employee
      KioskEmployees.update({_id: logRecordId}, {$set: {appCenterId: appCenterId}});
    }

    // Save the documents to the employee

    return empId;
  }
};


function syncDocs(hierId, instances, metadata) {

  console.log('syncing ' + instances.length + ' docs');

  _.each(instances, function (doc) {
    DocCenter.renderDocumentInstance(hierId, doc.documentInstanceId, function (err, result) {

      var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        frequency: 10,      // in milliseconds.
        chunkSize: 2048     // in bytes.
      });

      myReadableStreamBuffer.put(result);
      myReadableStreamBuffer.destroySoon(); //fires 'end'

      console.log('uploading...');
      var fileId = S3Storage.upload(myReadableStreamBuffer);
      console.log('end');



      if (!fileId) {

        return new Meteor.Error(500, "Error uploading resume to S3");
      }

      var file = {
        entityId: metadata.entityId,
        name: doc.documentName,
        type: 'application/pdf',
        extension: 'pdf',
        description: '',
        tags: 'HRC Kiosk',
        userId: metadata.userId,
        hierId: metadata.hierId,
        fileId: fileId
      };
      console.log('file', file);


      ContactablesFiles.insert(file);
    });
  });
}
