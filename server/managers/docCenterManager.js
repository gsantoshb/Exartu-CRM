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


    DocCenterMergeFields.find({}).forEach(function (mf) {
      DocCenter.insertMergeField(hier._id, {
        key: mf.key,
        testValue: mf.testValue,
        type: mf.type
      }, function(err, result){
        if (err){
          console.err('error inserting ' + mf.name, err);
        }else{

        }
      });
    });
  },
  insertUser: function (employeeId, userData, hierId) {

    var result = DocCenter.insertUser(hierId || Meteor.user().currentHierId, userData);

    Contactables.update(employeeId, { $set: { docCenter: result } });

  },
  updateMergeFields: function (mergeFieldId) {
    var mf = DocCenterMergeFields.findOne(mergeFieldId);
    if (!mf) return;

    DocCenter.updateMergeFieldForAllHiers(mf);
  },
  insertMergeFields: function (mergeFieldId) {
    var mf = DocCenterMergeFields.findOne(mergeFieldId);
    if (!mf) return;

    DocCenter.insertMergeFieldForAllHiers(mf);
  }
};

Meteor.methods({
  registerOnDocCenter: function () {
    var user = Meteor.user();

    var email = user.emails[0];

    email = email.address;

    return DocCenterManager.registerHier(user.currentHierId, email)
  },
  createDocCenterAccount: function (employeeID) {
    var employee = Contactables.findOne(employeeID);
    var email = _.find(employee.contactMethods, function(cm){
      var cmType = LookUps.findOne(cm.type);
      return _.contains(cmType.lookUpActions, Enums.lookUpAction.ContactMethod_Email);
    });

    if (!email) throw new Error('no email found for the employee');
    var userData = {
      userName: email.value,
      email: email.value
    };
    return DocCenterManager.insertUser(employeeID, userData)
  },
  documentInstancepdf: function (id) {
    var user = Meteor.user();

    return DocCenter.renderDocumentInstance(user.currentHierId, id);
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

    var initialValues = resolveMF(contactable, DocCenterMergeFields.find({ targetType: Enums.docCenterMergeFieldTypes.contactable }).fetch());

    var address = Addresses.findOne({linkId: contactable._id});

    initialValues = initialValues.concat(resolveMF(address,  DocCenterMergeFields.find({ targetType: Enums.docCenterMergeFieldTypes.address }).fetch()));

    return DocCenter.instantiateDocument(user.currentHierId, documentIds, docCenterId, initialValues);
  }
});

var resolveMF = function (entity, mergeFields) {

  var mapped = _.map(mergeFields, function (mf) {
    var parts = mf.path.split('.');
    var result = entity;

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
    };

    return {
      key: mf.key,
      value: result
    };
  });

  // filter the undefined ones
  return mapped.filter(function (mfValue) {
    return mfValue;
  });
};