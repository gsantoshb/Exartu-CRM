DocCenterManager = {
  registerHier: function (hier, email, cb) {
    if (_.isString(hier)){
      hier = Hierarchies.findOne(hier);
    }

    if (!hier) throw new Error('missing hier');
    if (!email) throw new Error('missing email');

    // register in docCenter
    DocCenter.register(hier.name, email, hier._id);

    // add merge fields
    // todo: improve this, maybe re-using something from email templates merge fields?
    _.each([{
      key: 'firstName',
      testValue: 'john',
      type: DocCenter.mergeFieldTypes.string
    },{
      key: 'lastName',
      testValue: 'Doe',
      type: DocCenter.mergeFieldTypes.string
    }], function (mf) {
      DocCenter.insertMergeField(hier._id, mf, function(err, result){
        if (err){
          console.err('error inserting ' + mf.name, err);
        }else{

        }
      });

    })

  },
  insertUser: function (employeeId, userData, hierId) {

    var result = DocCenter.insertUser(hierId || Meteor.user().currentHierId, userData);

    Contactables.update(employeeId, { $set: { docCenter: result } });

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
  }
});