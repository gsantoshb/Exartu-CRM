schemaEditContactable = new SimpleSchema({
  'personFirstName': {
    type: String,
    optional: true
  },
  'personMiddleName': {
    type: String,
    optional: true
  },
  'personLastName': {
    type: String,
    optional: true
  },
  'personJobTitle': {
    type: String,
    optional: true
  },
  'personBirthDate':{
    type: Date,
    optional: true
  },
  'organizationOrganizationName':{
    type: String,
    optional: true
  },
  'clientDepartment':{
    type:String,
    optional:true
  },
  'clientStatus':{
      type:String,
      optional:true
  },
  'employeeStatus':{
    type:String,
    optional:true
  },
  'contactStatus':{
    type:String,
    optional:true
  },
  'statusNote':{
    type:String,
    optional:true
  },
  'howHeardOf':{
    type:String,
    optional:true
  },
  'taxID':{
    type:String,
    regEx: /^(((?!000|666)[0-8][0-9]{2})(-(?!00)[0-9]{2}-|(?!00)[0-9]{2})(?!0000)[0-9]{4})?$/,
    optional:true
  },
  'workerCompCode':{
    type:String,
    optional:true
  },
  'user':{
    type:String,
    optional:true
  },
  'clientLostReason':{
    type:String,
    optional:true
  },
  'activeStatus':{
    type:String,
    optional:true
  }


  //phone: {
  //  type: String,
  //  regEx:/^[\+]?[\s\(\)\-\d]+[\s]*$/,
  //  optional: true
  //}
});



EditDirectDepositMode = {
  val: false,
  dep: new Tracker.Dependency,
  show: function () {
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};

Object.defineProperty(EditDirectDepositMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function (newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

EditMode = {
    val: false,
    dep: new Deps.Dependency,
    show: function () {
        this.val = true;
        this.dep.changed();
    },
    hide: function () {
        this.val = false;
        this.dep.changed();
    }
};

Object.defineProperty(EditMode, "value", {
    get: function () {
        this.dep.depend();
        return this.val;
    },
    set: function (newValue) {
        this.val = newValue;
        this.dep.changed();
    }
});

var contactable = {};
var hideTaxID = new ReactiveVar(true);
var statusDep = new Deps.Dependency;
var userSelected = new ReactiveVar();

Template.contactableDetailBox.onRendered(function () {
  userSelected.set(this.data.userId);
});


Template.contactableDetailBox.helpers({
    getLostStatusId: function(){
      var lookUp = LookUps.findOne({lookUpActions:Enums.lookUpAction.Client_Lost, lookUpCode: Enums.lookUpCodes.client_status});
      return lookUp._id;
    },
    buttonsActiveStatus: function(){
      var activeArray = LookUps.find({lookUpCode:Enums.lookUpCodes.active_status}).fetch();
      var arrayButtons = _.map(activeArray, function(a){
        return {displayName: a.displayName, value: a._id}
      })
      return arrayButtons;
    },
    buttonsProcessStatus: function(){
      var arrayButtons =[];

      if(this.Client){
        var processArray = LookUps.find({lookUpCode:Enums.lookUpCodes.client_status}).fetch()
          arrayButtons = _.map(processArray, function(a){
          return {displayName: a.displayName, value: a._id}
        })

      }
      else if(this.Employee) {
        var processArray = LookUps.find({lookUpCode:Enums.lookUpCodes.employee_status}).fetch()
          arrayButtons = _.map(processArray, function(a){
          return {displayName: a.displayName, value: a._id}
        })

      }
      else if(this.Contact){
        var processArray = LookUps.find({lookUpCode:Enums.lookUpCodes.contact_status}).fetch()
          arrayButtons = _.map(processArray, function(a){
          return {displayName: a.displayName, value: a._id}
        })

      }
        return arrayButtons;
    },

    buttonsLostStatus: function(){
      var arrayButtons =[];
      var lostArray = LookUps.find({lookUpCode:Enums.lookUpCodes.client_lostReason}).fetch()
      arrayButtons = _.map(lostArray, function(a){
        return {displayName: a.displayName, value: a._id}
      })
      return arrayButtons;
    },
    buttonsHowHeardOf: function(){
      var arrayButtons =[];
      var heardOfArray = LookUps.find({lookUpCode:Enums.lookUpCodes.howHeardOf}).fetch()
      arrayButtons = _.map(heardOfArray, function(a){
        return {displayName: a.displayName, value: a._id}
      })
      return arrayButtons;
    },
    getLostStatusId: function(){
      var lostStatus = LookUps.findOne({lookUpActions:Enums.lookUpAction.Client_Lost,lookUpCode:Enums.lookUpCodes.client_status})
      return lostStatus._id;
    },
    created: function () {
        EditMode.hide();
    },
    isSelected: function (value1, value2) {
        return value1 == value2
    },
    contactable: function () {
        var toReturn = {};
        toReturn._id = this._id;
        if(this.person){
          toReturn.personFirstName = this.person.firstName;
          toReturn.personLastName = this.person.lastName;
          toReturn.personMiddleName = this.person.middleName;
          toReturn.personJobTitle = this.person.jobTitle;
          toReturn.personBirthDate = this.person.birthDate;
          toReturn.person = true;
        }
        if(this.organization){
          toReturn.organizationOrganizationName = this.organization.organizationName;
          toReturn.organization = true;
        }
        if(this.Client){
          toReturn.clientDepartment = this.Client.department;
          toReturn.clientStatus = this.Client.status;
          toReturn.workerCompCode = this.Client.workerCompCode;
          toReturn.Client = true;
          toReturn.clientLostReason = this.Client.lostReason;

        }
        if(this.Employee){
          toReturn.employeeStatus = this.Employee.status;
          toReturn.Employee = true;
          toReturn.taxID = this.Employee.taxID;
          toReturn.employeeStatus = this.Employee.status;
        }
        if(this.Contact){
          toReturn.contactStatus = this.Contact.status;
          toReturn.Contact = true;
        }
        toReturn.howHeardOf = this.howHeardOf;
        toReturn.activeStatus = this.activeStatus;
        toReturn.userId = this.userId;
        toReturn.statusNote = this.statusNote;
        return toReturn;
    },
    originalContactable: function () {
      return Contactables.findOne(this._id);
    },
    editMode: function () {
        return EditMode.value;
    },
    isAdmin: function () {
        return Utils.adminSettings.isAdmin();
    },
    editModeColor: function () {
        return EditMode.value ? '#008DFC' : '';
    },
    fetchOptions: function () {
      return Utils.sortFetchOptions(this.options);
    },
    //lostClient: function () {
    //    statusDep.depend();
    //    if (this.Client && this.Client.status) {
    //        var lkp = LookUps.findOne({_id: this.Client.status});
    //        if (lkp) return (_.contains(lkp.lookUpActions, Enums.lookUpAction.Client_Lost));
    //    }
    //    return false;
    //},
    onSelectedStatus: function () {
        return function (newStatus) {
            var ctx = Template.parentData(2);
            ctx.property._value = newStatus;
            statusDep.changed();
        }
    },
    getActiveStatus: function(){
      var lookUp = LookUps.findOne({_id:  this.activeStatus});
      return lookUp.displayName;
    },
    getProcessStatus: function(){
      var processStatus;
      if(this.Employee) {
        processStatus = LookUps.findOne({_id:  this.employeeStatus});
      }
      else if(this.Contact){
        processStatus = LookUps.findOne({_id:  this.contactStatus});
      }
      else if(this.Client){
        processStatus = LookUps.findOne({_id:  this.clientStatus});
      }
      return processStatus.displayName;
    },
    getHowHeardOf: function(){
      var lookUp = LookUps.findOne({_id:  this.howHeardOf});
      return lookUp.displayName;
    },
    getLostReason: function(){
      var lookUp = LookUps.findOne({_id:  this.clientLostReason});
      if(lookUp) {
        return lookUp.displayName;
      }
      else{
        return null;
      }
    },
    hideTaxID: function () {
        return hideTaxID.get();
    },
    datePickerOptions: function () {
        return {
            format: "MM dd, yyyy",
            minViewMode: "days",
            startView: "months"
        }
    },
    users: function () {
         return _.map(Meteor.users.find().fetch(),function(u){
           var displayName = Utils.getUserDisplayName(u._id)
           return {label: displayName, value: u._id}});
    },
    isSelectedUser: function () {
        var c = Contactables.findOne(contactable._id);
        return c.userId == this._id;
    },
    isLost:function(){
      var lookUp = LookUps.findOne({lookUpActions:Enums.lookUpAction.Client_Lost, lookUpCode: Enums.lookUpCodes.client_status});
      return (lookUp._id === this.clientStatus);
    }

});

Template.contactableDetailBox.events = {
    'click #edit-mode': function () {
        if (EditMode.value) {
            EditMode.hide();
            //contactable.reset();
        }
        else
            EditMode.show();
    },
    //'click #save-details': function () {
    //    if (!contactable.validate()) {
    //        contactable.showErrors();
    //        return;
    //    }
    //
    //    contactable.save(function (err) {
    //            if (!err) {
    //                EditMode.hide();
    //            }
    //            else {
    //                //alert('contactable save error' + err);
    //                console.log('contactable', contactable);
    //            }
    //    });
    //
    //    var originalContactable = Contactables.findOne(contactable._id);
    //    if (originalContactable.userId != userSelected.get()){
    //        Meteor.call('changeContactableUserId', contactable._id, userSelected.get(), function (err) {
    //            err && console.log(err);
    //        })
    //    }
    //},
    'click #cancel-details': function () {
        EditMode.hide();
        //contactable.reset();
    },
    'click .showHideTaxId': function () {
        hideTaxID.set(!hideTaxID.get());
    },
    'change #userSelect': function (e, ctx) {
      userSelected.set(e.target.value)
    }
};

Template.displayDirectDeposit.events = {
  'click #edit-deposit-method-mode': function() {
    if (EditDirectDepositMode.value) {
      EditDirectDepositMode.hide();
    }
    else{
      EditDirectDepositMode.show();
    }
  },
  'click #save-changes-method': function(){
    var routingNumber = $('#routingNumber').val();
    var accountNumber = $('#accountNumber').val();
    Contactables.update({_id: contactable._id},
      {$set:{'Employee.routingNumber': routingNumber, 'Employee.accountNumber': accountNumber }

      });
    EditDirectDepositMode.hide();

  },
  'click #cancel-deposit-method': function(){
    EditDirectDepositMode.hide();
  }
}

Template.displayDirectDeposit.helpers({
  editMode: function () {
    return EditDirectDepositMode.value;
  }
})

Template.displayLatestNotes.helpers({
  latestNotes: function(){
    if(this.latestNotes) {
      var arrayPrueba = [];
      arrayPrueba = _.clone(this.latestNotes);
      return arrayPrueba.reverse();
    }
    else{
      return [];
    }
  }
})

AutoForm.hooks({
  updateContactable: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      Meteor.call('updateContactable',updateDoc,currentDoc._id, function(err, res){
        EditMode.hide();
      })
      return false;
    }
  }
})