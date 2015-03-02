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
        //
        //this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //self.response.setHeader("Content-Length", result.content.length);

        //self.response.statusCode = 200;
        self.response.end(result);
      });



      //this.response.writeHead("Content-Type", "application/pdf");
      //this.response.writeHead("Accept-Ranges", "bytes");
      //this.response.writeHead("Content-Length", result.length);

      //console.log('---- seting headers');
      //self.response.writeHead(response.statusCode, response.headers);
      //
      //
      //setTimeout(function () {
      //  console.log('---- writing Response');
      //  self.response.write(response.content);
      //  console.log('---- ending response');
      //  self.response.end();
      //},10000);

      //this.response.end()

    }
  })
});
