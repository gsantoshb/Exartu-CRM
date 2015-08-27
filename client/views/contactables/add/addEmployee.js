schemaAddEmployee = new SimpleSchema({
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
  'taxId':{
    type:String,
    optional:true,
    regEx: /^(((?!000|666)[0-8][0-9]{2})(-(?!00)[0-9]{2}-|(?!00)[0-9]{2})(?!0000)[0-9]{4})?$/
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
var employee;

Template.addEmployee.created = function(){
  if(Router.current().params) {
    employee = {};
    employee.phone = Router.current().params.query.phone;
  }
};

Template.addEmployee.helpers({
  'employee': function(){
    return employee;
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
  }
})


AutoForm.hooks({
  addEmployee: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var employee = {}
      var contactMethods = [];
      employee.objNameArray = ["person", "Employee", "contactable"];
      var person = {firstName:insertDoc.personFirstName,middleName: insertDoc.personMiddleName, lastName: insertDoc.personLastName, jobTitle: insertDoc.personJobTitle,salutation:"", birthDate:null};
      employee.person = person;
      var lkActive = LookUps.findOne({lookUpCode:Enums.lookUpCodes.active_status,lookUpActions:Enums.lookUpAction.Implies_Active});
      employee.activeStatus = lkActive._id;
      if(insertDoc.phone){
        contactMethods.push({value:insertDoc.phone, type:insertDoc.phoneType});
      }
      if(insertDoc.email){
        contactMethods.push({value:insertDoc.email, type:insertDoc.emailType});
      }
      employee.contactMethods = contactMethods;
      employee.hierId = Meteor.user().currentHierId;
      employee.userId = Meteor.user()._id;
      employee.createdBy = Meteor.user()._id;
      employee.dateCreated = new Date();
      employee.statusNote = insertDoc.statusNote;
      employee.howHeardOf = null;
      var lkStatus = LookUps.findOne({lookUpCode:Enums.lookUpCodes.employee_status, isDefault:true})
      employee.Employee = {status: lkStatus._id,taxID: insertDoc.taxId, routingNumber:"",dateAvailable:null,
                           dependentNumber:0, accountNumber:"", convictions:"", gender:"", ethnicity:"",
                           hasTransportation: false, desiredPay:0, availableStartDay:"", availableShift:"",
                           i9OnFile: false, i9ExpireDate:null, orientationDate:null, hireDate:null}
      Meteor.call('addContactable',employee, function(err, res){
        if(res) {
          Router.go('/contactable/' + res);
        }
        else{
          Utils.showModal('basicModal', {
            title: 'Error creating employee',
            message: err.reason,
            buttons: [{
              label: 'Ok',
              classes: 'btn-success',
              value: true
            }]
          })
        }
      })

      return false;
    }
  }
})