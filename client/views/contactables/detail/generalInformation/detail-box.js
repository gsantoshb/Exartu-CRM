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
  set: function(newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var contactable = {};

Template.contactableDetailBox.helpers({
  created:function(){
    EditMode.hide();
  },
  isSelected: function(value1, value2){
    return value1==value2
  },
  contactable: function() {
    contactable = new dType.objInstance(this, Contactables);
    return contactable;
  },
  editMode : function() {
    return EditMode.value;
  },
  editModeColor: function() {
    return EditMode.value? '#008DFC' : '';
  }
});

Template.contactableDetailBox.events = {
  'click #edit-mode': function() {
    if (EditMode.value) {
      EditMode.hide();
      contactable.reset();
    }
    else
      EditMode.show();
  },
  'click #save-details': function() {
    if (!contactable.validate()) {
      contactable.showErrors();
      return;
    }
    console.dir(contactable.getUpdate());
    contactable.save(function(err, result) {
      if (!err) {
        EditMode.hide();
//        contactable.reset();
        GAnalytics.event("/contactable", "Edit contactable details", contactable.getUpdate() != {}? 'With changes' : 'Without changes');
      }
    });
  },
  'click #cancel-details': function() {
    EditMode.hide();
    contactable.reset();
  }
}