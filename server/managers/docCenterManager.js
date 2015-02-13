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
      console.log('inserting ' + mf.key);
      DocCenter.insertMergeField(hier._id, mf, function(err, result){
        if (err){
          console.err('error inserting ' + mf.name, err);
        }else{
          console.log('OK [' + mf.key + ']');
        }
      });

    })

  }
};

Meteor.methods({
  registerOnDocCenter: function () {
    var user = Meteor.user();

    var email = user.emails[0];

    DocCenterManager.registerHier(user.currentHierId, email, function () {

    })
  }
});