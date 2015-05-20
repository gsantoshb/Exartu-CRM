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
var userSelected = new ReactiveVar(true);

Template.contactableDetailBox.helpers({
    created: function () {
        EditMode.hide();
    },
    isSelected: function (value1, value2) {
        return value1 == value2
    },
    contactable: function () {
        contactable = new dType.objInstance(this, Contactables);
        return contactable;
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
    lostClient: function () {
        statusDep.depend();
        if (contactable.status.value) {
            var lkp = LookUps.findOne({_id: contactable.status.value});
            if (lkp) return (_.contains(lkp.lookUpActions, Enums.lookUpAction.Client_Lost));
        }
        return false;
    },
    onSelectedStatus: function () {
        return function (newStatus) {
            var ctx = Template.parentData(2);
            ctx.property._value = newStatus;
            statusDep.changed();
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