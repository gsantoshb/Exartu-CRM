/**
 * Created by ramiro on 21/07/15.
 */
var contact;
var client = new ReactiveVar();
schemaAddContact = new SimpleSchema({
  'personFirstName': {
    type: String,
    optional: false
  },
  'personMiddleName': {
    type: String,
    optional: true
  },
  'personLastName': {
    type: String,
    optional: false
  },
  'personJobTitle': {
    type: String,
    optional: true
  },
  'status':{
    type:String,
    optional:true
  },
  'client':{
    type:String,
    optional:true
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
Template.addContact.created = function(){
  client.set(false);
  if(Router.current().params) {
    contact = {};
    contact.client = Router.current().params.query.client;
    contact.phone = Router.current().params.query.phone;
  }
  if(contact){
    Meteor.call('getContactableById', contact.client, function(err, res){
      if(res)
        client.set(res);
    })
  }
}
Template.addContact.helpers({
  'contact': function(){
    return contact;
  },
  'status': function(){
    var processArray = LookUps.find({lookUpCode:Enums.lookUpCodes.contact_status}).fetch()
    var toReturn = _.map(processArray, function(a){
      return {label: a.displayName, value: a._id}
    })
    return toReturn;
  },
  'getClients': function(){
    return {getCollection: function (string) {
      var self = this;

      //todo: calculate method
      Meteor.call('findClient', string, function (err, result) {
        if (err)
          return console.log(err);

        self.ready(_.map(result, function (r) {
            var text = r.organization.organizationName;
            if (r.Client) text = text + '/' + r.Client.department;
            text = text ;
            return {id: r._id, text: text};
          })
        );
      });
    }}
  },
  'clientChanged': function(){
    return {selectionChanged: function (value) {
      this.value = value;
      }
  }
  },
  'emailTypes': function(){
    return _.map(LookUps.find({lookUpActions: Enums.lookUpAction.ContactMethod_Email}).fetch(), function(r){
      return {label:r.displayName, value:r._id};
    })
  },
  'phoneTypes': function(){
    return _.map(LookUps.find({lookUpActions: Enums.lookUpAction.ContactMethod_Phone}).fetch(), function(r){
      return {label:r.displayName, value:r._id};
    })
  },
  'client': function(){
    if(_.isEmpty(contact)){
      return false
    }
    else{
      if(client.get()){
       return client.get().displayName;
      }
      else{
       return false;
      }
    }

  }
})

AutoForm.hooks({
  addContact: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var contact = {}
      contact.objNameArray = ["person", "Contact", "contactable"];
      var person = {
        firstName: insertDoc.personFirstName,
        middleName: insertDoc.personMiddleName,
        lastName: insertDoc.personLastName,
        jobTitle: insertDoc.jobTitle,
        salutation: "",
        birthDate: null
      };
      contact.person = person;
      var lkActive = LookUps.findOne({
        lookUpCode: Enums.lookUpCodes.active_status,
        lookUpActions: Enums.lookUpAction.Implies_Active
      });
      contact.activeStatus = lkActive._id;
      var contactMethods = [];
      if (insertDoc.phone) {
        contactMethods.push({value: insertDoc.phone, type: insertDoc.phoneType});
      }
      if (insertDoc.email) {
        contactMethods.push({value: insertDoc.email, type: insertDoc.emailType});
      }
      contact.contactMethods = contactMethods;
      contact.hierId = Meteor.user().currentHierId;
      contact.userId = Meteor.user()._id;
      contact.createdBy = Meteor.user()._id;
      contact.dateCreated = new Date();
      contact.statusNote = insertDoc.statusNote;
      contact.howHeardOf = null;
      if (client.get()) {
        contact.Contact =  {client: client.get()._id, clientName: client.get().displayName, status: client.get().Client.status}
        Meteor.call('addContactable', contact, function (err, res) {
          Router.go('/contactable/' + client.get()._id);
        })
        return false;
      }
      else {
        Meteor.call('getContactableById', insertDoc.client, function (err, res) {
          contact.Contact = {client: res._id, clientName: res.displayName, status: res.Client.status}
          Meteor.call('addContactable', contact, function (err, res) {
            Router.go('/contactable/' + res);
          })
        })
        return false;
      }
    }
  }
})