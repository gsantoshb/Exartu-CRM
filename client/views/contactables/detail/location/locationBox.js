EditLocationMode = {
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
    EditLocationMode.value = false;
  }
};