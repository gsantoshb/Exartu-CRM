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

    var emailCMTypes =  _.pluck(LookUps.find({
      lookUpCode: Enums.lookUpCodes.contactMethod_types,
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
