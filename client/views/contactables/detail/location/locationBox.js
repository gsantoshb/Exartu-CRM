var oldValue;
EditLocationMode = {
  val: false,
  dep: new Deps.Dependency,
  show: function () {
    this.val = true;
    oldValue = location.value;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};
Object.defineProperty(EditLocationMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function (newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

LocationSchema = new SimpleSchema({
  address: {
    type: String,
    label: 'Address line 1',
    optional: true
  },
  address2: {
    type: String,
    label: 'Address line 2',
    optional: true
  },
  city: {
    type: String,
    label: 'City',
    optional: true
  },
  state: {
    type: String,
    label: 'State',
    optional: true
  },
  country: {
    type: String,
    label: 'Country',
    optional: true
  },
  postalCode: {
    type: Number,
    label: 'Zip code',
    optional: true
  }
});

AutoForm.hooks({
  SetLocation: {
    onSubmit: function(address) {
      var id = UI._parentData(1)._id;
      Meteor.call('setContactableAddress', id, address, function() {
        location.value = address;
        EditLocationMode.hide();
      });

      this.done();
      this.resetForm();
      return false;
    }
  }
});

Template.contactableLocationBox.editMode = function () {
  return EditLocationMode.value;
};

Template.contactableLocationBox.editModeColor = function () {
  return EditLocationMode.value ? '#008DFC' : '';
};

var location = {};
Utils.reactiveProp(location, 'value', null);

Template.contactableLocationBox.created = function() {
  location.value = this.data.location;
};

Template.contactableLocationBox.location = function() {
  return location;
};

Template.contactableLocationBox.events = {
  'click #edit-Location': function (e, ctx) {
    if (EditLocationMode.value) {
      EditLocationMode.hide();
    }
    else {
      EditLocationMode.show();
      ctx.$('input').focus();
    }
  },
  'click #save-location': function () {
    Contactables.update({ _id: this._id }, { $set: { location: location.value } });
    EditLocationMode.value = false;
  },
  'click #cancel-location': function () {
    location.value = oldValue;
    EditLocationMode.value = false;
  }
};