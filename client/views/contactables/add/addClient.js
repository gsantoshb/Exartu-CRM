schemaAddClient = new SimpleSchema({
  'organizationName': {
    type: String,
    optional: false
  },
  'department': {
    type: String,
    optional: true
  },
  'statusNote':{
    type:String,
    optional:true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    regEx:/^[\+]?[\s\(\)\-\d]+[\s]*$/,
    optional: true
  },
  phoneType:{
    type: String,
    optional: true,
    custom: function() {
      if ($('#phone').val() && (this.value === undefined)) {
        return "required"
      }

    }
  },
  emailType:{
    type: String,
    optional:true,
    custom: function() {
      if ( $('#email').val() && (this.value === undefined)) {
        return "required"
      }

    }
  }
});

Template.addClient.helpers({
  'emailTypes': function(){
    return _.map(LookUps.find({lookUpActions: Enums.lookUpAction.ContactMethod_Email}).fetch(), function(r){
      return {label:r.displayName, value:r._id};
    })
  },
  'phoneTypes': function() {
    return _.map(LookUps.find({lookUpActions: Enums.lookUpAction.ContactMethod_Phone}).fetch(), function (r) {
      return {label: r.displayName, value: r._id};
    })
  }
})

AutoForm.hooks({
  addClient: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      debugger;
      //
      var client = {}
      client.objNameArray = ["organization", "Client", "contactable"];
      client.organization = {
        organizationName: insertDoc.organizationName
      }
      client.Client = {
        department: insertDoc.department,
        status: null,
        lostReason: null,
        workerCompCode: ""
      }
      client.hierId = Meteor.user().currentHierId;
      client.userId = Meteor.user()._id;
      client.dateCreated = new Date();
      client.createdBy = Meteor.user()._id;

      //var person = {firstName:insertDoc.personFirstName,middleName: insertDoc.personMiddleName, lastName: insertDoc.personLastName, jobTitle: insertDoc.jobTitle,salutation:"", birthDate:null};
      //contact.person = person;
      var lkActive = LookUps.findOne({lookUpCode:Enums.lookUpCodes.active_status,lookUpActions:Enums.lookUpAction.Implies_Active});
      client.activeStatus = lkActive._id;
      client.statusNote = insertDoc.statusNote;
      client.howHeardOf = null;
        //contact.activeStatus = lkActive._id;
      var contactMethods = [];
      if(insertDoc.phone){
        contactMethods.push({value:insertDoc.phone, type:insertDoc.phoneType});
      }
      if(insertDoc.email){
        contactMethods.push({value:insertDoc.email, type:insertDoc.emailType});
      }
      client.contactMethods = contactMethods;
      Meteor.call('addContactable',client, function(err, res){
         Router.go('/contactable/' + res);
      })


      return false;
    }
  }
})