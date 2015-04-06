/**
 * Created by visualaram on 1/27/15.
 */
AddAddressMode = {
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

Object.defineProperty(AddAddressMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function (newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var dep = new Tracker.Dependency;

Template.addressBox.helpers({
  editMode: function () {
    return AddAddressMode.value;
  },

  editModeColor: function () {
    return AddAddressMode.value ? '#008DFC' : '';
  }

});

Template.addressBox.events = {
  'click #create-address-mode': function() {
    if (AddAddressMode.value) {
      AddAddressMode.hide();
    }
    else{
      AddAddressMode.show();
    }
  }
};

