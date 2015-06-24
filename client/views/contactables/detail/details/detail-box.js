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
    buttonsActiveStatus: function(){
      var arrayButtons = [{displayName:"Active", value:"Active"},{displayName:"Inactive",value:"Inactive"}];
      return arrayButtons;
    },
    buttonsProcessStatus: function(){
      var arrayButtons =[];
      if(this.Client){
        arrayButtons = [{displayName: "Lost", value: "Lost"}, {displayName: "Prospect", value: "Prospect"},
          {displayName: "Need Analysis", value: "NeedAnalysis"}, {displayName: "Proposal", value: "Proposal"}, {
            displayName: "Negotiation",value: "Negotiation"},{displayName: "Won",value: "Won"}];
      }
      else {
        arrayButtons = [{displayName: "Lead", value: "Lead"}, {displayName: "Applicant", value: "Applicant"},
          {displayName: "Candidate", value: "Candidate"}, {displayName: "Hired", value: "Hired"}, {
            displayName: "Other",
            value: "Other"
          }];
      }
        return arrayButtons;
    },
    buttonsLostStatus: function(){
      var arrayButtons = [{displayName:"Contract terms", value:"contractTerms"},{displayName:"Location issue",value:"locationIssue"},
        {displayName:"Rate issue",value:"rateIssue"},{displayName:"Slow service",value:"slowService"}];
      return arrayButtons;
    },
    created: function () {
        EditMode.hide();
    },
    isSelected: function (value1, value2) {
        return value1 == value2
    },
    contactable: function () {

        //contactable = new dType.objInstance(this, Contactables);
        return this;
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
      var activeStatus = LookUps.findOne({_id:this.activeStatus});
      return activeStatus.displayName;
    },
    getProcessStatus: function(){
      var processStatus;
      if(this.Employee) {
        processStatus = LookUps.findOne({_id: this.Employee.status});
      }
      else if(this.Contact){
        processStatus = LookUps.findOne({_id: this.Contact.status});
      }
      else if(this.Client){
        processStatus = LookUps.findOne({_id: this.Client.status});
      }
        return processStatus.displayName;
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
        return Meteor.users.find();
    },
    isSelectedUser: function () {
        var c = Contactables.findOne(contactable._id);
        return c.userId == this._id;
    }
});

Template.contactableDetailBox.events = {
    'click #edit-mode': function () {
        if (EditMode.value) {
            EditMode.hide();
            contactable.reset();
        }
        else
            EditMode.show();
    },
    'click #save-details': function () {
        if (!contactable.validate()) {
            contactable.showErrors();
            return;
        }

        contactable.save(function (err) {
                if (!err) {
                    EditMode.hide();
                }
                else {
                    //alert('contactable save error' + err);
                    console.log('contactable', contactable);
                }
        });

        var originalContactable = Contactables.findOne(contactable._id);
        if (originalContactable.userId != userSelected.get()){
            Meteor.call('changeContactableUserId', contactable._id, userSelected.get(), function (err) {
                err && console.log(err);
            })
        }
    },
    'click #cancel-details': function () {
        EditMode.hide();
        contactable.reset();
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