DocCenterManager = {
  registerHier: function (hier, email, cb) {
    if (_.isString(hier)){
      hier = Hierarchies.findOne(hier);
    }

    if (!hier) throw new Error('missing hier');
    if (!email) throw new Error('missing email');

    // register in docCenter
    var hierName = hier.name.replace(/\s/g, '_');
    DocCenter.register(hierName, email, hier._id);


    DocCenterMergeFields.forEach(function (mf) {

      DocCenterManager.insertMergeField(hier._id, mf);

    });
  },

  setUpEmployeeAccount: function (employeeId, email, hierId) {
    // Validate parameters
    if (!employeeId) throw new Error('Employee ID is required');
    if (!email) throw new Error('Email is required');

    var employee = Contactables.findOne({_id: employeeId});
    if (!employee) throw new Error('Invalid employee ID');

    var userData = {
      userName: email,
      email: email
    };

    // Create the user in doc center
    var result = DocCenter.insertUser(hierId || Meteor.user().currentHierId, userData);

    // Update the employee with the account information
    return Contactables.update(employeeId, { $set: { docCenter: result } });
  },

  getUserDocuments: function(employeeId) {
    // Validations
    if (!employeeId) throw new Error('Employee ID is required');
    var employee = Contactables.findOne({_id: employeeId});
    if (!employee) throw new Error('Invalid employee ID');
    if (!employee.docCenter) throw new Error('Employee does not have an HR Concourse account');

    var future = new Future();

    DocCenter.getDocumentInstances(employee.hierId, employee.docCenter.docCenterId, function (err, result) {
      if (err) {
        console.log(err);
        future.throw(err);
      } else {
        future.return(result);
      }
    });

    return future.wait();
  },
  getUserToken: function (employeeId) {
    // Validations
    if (!employeeId) throw new Error('Employee ID is required');
    var employee = Contactables.findOne({_id: employeeId});
    if (!employee) throw new Error('Invalid employee ID');
    if (!employee.docCenter) throw new Error('Employee does not have an HR Concourse account');

    var future = new Future();

    DocCenter.getUserToken(employee.hierId, employee.docCenter.docCenterId, function (err, result) {
      if (err) {
        console.log(err);
        future.throw(err);
      } else {
        future.return(result);
      }
    });

    return future.wait();
  },

  insertMergeField: Meteor.wrapAsync(function (hierId, mf, cb) {
    DocCenter.insertMergeField(hierId, {
      key: mf.key,
      testValue: mf.testValue,
      type: mf.type
    }, cb);
  }),

  removeMergeField: Meteor.wrapAsync(function (hierId, mfKey, cb){
    //DocCenter.deleteMergeField(hierId, mfKey, cb);
  }),

  updateMergeField: function (hierId, mf) {
    //DocCenterManager.removeMergeField(hierId, mf.key);
    //DocCenterManager.insertMergeField(hierId, mf);
  },

  syncMergeFields: function () {
    var localMergeFields = DocCenterMergeFields;

    // for all hierarchies that have account
    Hierarchies.find().forEach(function (hier) {

      try {

        if (! DocCenter.accountExists(hier._id)) return;

        var remoteMergeFields = DocCenter.getMergeFields(hier._id);

        localMergeFields.forEach(function (localMF) {
          var remoteMF = _.findWhere(remoteMergeFields, {key: localMF.key});

          if (!remoteMF){

            DocCenterManager.insertMergeField(hier._id, localMF);

          }
        //  else{
        //
        //    var areEquals = _.every(['key', 'testValue', {local: 'type', remote: 'fieldType' }], function (prop) {
        //
        //      if (_.isString(prop)){
        //        var localVal = localMF[prop],
        //          remoteVal = remoteMF[prop];
        //      }else{
        //
        //        var localVal = localMF[prop.local],
        //          remoteVal = remoteMF[prop.remote];
        //      }
        //      if (remoteVal != localVal){
        //        return false;
        //      }
        //
        //      return true;
        //    });
        //
        //    if (! areEquals){
        //      DocCenterManager.updateMergeField(hier._id, localMF);
        //    }
        //  }
        //
        //  // remove it so i can check which ones are not in localMergeFields
        //  remoteMergeFields.splice(remoteMergeFields.indexOf(remoteMF), 1);
        //
        //});
        //
        //// if there is any one left in the array then it's not in localMergeFields and it should be removed
        //remoteMergeFields.forEach(function (remoteMF) {
        //  DocCenterManager.removeMergeField(hier._id, remoteMF.key);
        })
      } catch (e){
        console.log('failed ' + hier._id );
        console.error(e);
      }

    })

  }
};

Meteor.methods({
  registerOnDocCenter: function () {
    var user = Meteor.user();

    var email = user.emails[0];

    email = email.address;

    return DocCenterManager.registerHier(user.currentHierId, email)
  },
  createDocCenterAccount: function (employeeId) {
    var employee = Contactables.findOne(employeeId);

    var emailCMTypes =  _.pluck(LookUps.find({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: {$in: [
        Enums.lookUpAction.ContactMethod_Email,
        Enums.lookUpAction.ContactMethod_PersonalEmail,
        Enums.lookUpAction.ContactMethod_WorkEmail
      ]}
    }).fetch(), '_id');

    var email = _.find(employee.contactMethods, function (cm) {
      return _.indexOf(emailCMTypes, cm.type) != -1
    });

    if (!email) throw new Error('no email found for the employee');

    return DocCenterManager.setUpEmployeeAccount(employeeId, email.value, employee.hierId);
  }
});

Router.map(function() {
  this.route('documentInstancepdf', {
    where: 'server',
    path: 'documentInstancepdf/:token/:id?',
    action: function() {

      var self = this;
      var user = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(self.params.token) });

      self.response.setHeader("Content-Type", "application/pdf");

      var response = DocCenter.renderDocumentInstance(user.currentHierId, self.params.id, function (err, result) {
        self.response.end(result);
      });

    }
  })
});


Meteor.methods({
  'instantiateDocumentForContactable': function (documentIds, docCenterId, contactableId) {
    var user = Meteor.user();

    var contactable = Contactables.findOne(contactableId);

    var initialValues = resolveMF(contactable, _.filter(DocCenterMergeFields, function(mf){return mf.targetType == Enums.docCenterMergeFieldTypes.contactable}));

    var address = Addresses.findOne({linkId: contactable._id});

    initialValues = initialValues.concat(resolveMF(address, _.filter(DocCenterMergeFields, function(mf){return mf.targetType == Enums.docCenterMergeFieldTypes.address})));

    var docInstance = DocCenter.instantiateDocument(user.currentHierId, documentIds, docCenterId, initialValues);

    if (!contactable.Client) {
      var hier = Hierarchies.findOne({_id: user.currentHierId});
      var webName = hier.configuration.webName;
      var url = ExartuConfig.ApplicantCenter_URL + webName;
      var doclist = '';
      _.forEach(docInstance, function(d){
        doclist = doclist + d.documentName + '\n';
      })
      var text = "Dear "+contactable.displayName +",\n\n"
        +"This is an automated reminder from your Aida software system.  You have the following documents to fill:\n\n"
        + doclist
        +"\nPlease log into Applicant Center to fill, using the following URL:\n"
        + url
        + "\n\nThank you,"
        + "Aïda team";

      EmailManager.sendEmail(contactable.docCenter.Email, "New documents to fill", text, false);
    }

    return docInstance;
  }
});

var resolveMF = function (entity, mergeFields) {

  var mapped = _.map(mergeFields, function (mf) {
    var result;
    if (mf.path){
      var parts = mf.path.split('.');
      result = entity;
      parts.forEach(function (part) {
        if (!result) return;

        // check if it this part targets an array property
        var arraySelector = part.match(/\[(.+)\]/);
        if (arraySelector){

          // get the property name
          var propPart = part.replace(arraySelector[0],'');

          result = result[propPart];

          if (! _.isArray(result)){
            result = undefined;
            return;
          }

          var index = arraySelector[1];

          if (!isNaN(parseInt(index))){
            result = result[parseInt(index)];
          }
          // todo: parse object and call _.findWhere ???

        } else {
          result = result[part];
        }

      });
      if (!result) return {
        key: mf.key,
        value: ''
      }

      return {
        key: mf.key,
        value: result
      };
    } else {
      result = '';
      if (mf.get){
        result = mf.get(entity);
      }
      return {
        key: mf.key,
        value: result
      };
    }
  });

  // filter the undefined ones
  return mapped.filter(function (mfValue) {
    return mfValue;
  });
};
