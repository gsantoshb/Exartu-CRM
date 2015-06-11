var editMode = new ReactiveVar(false);

Template.employeeHireInfo.onCreated(function () {
  editMode.set(false);
  objInstance = null;
  var contactable = Contactables.findOne(Session.get('entityId'));

  availableStartDate = {};
  if (contactable){
    availableStartDate = contactable.Employee.availableStartDate || {};
  }
  availableStartDateChanged = false;

  availableShifts = {};
  if (contactable){
    availableShifts = contactable.Employee.availableShifts || {};
  }
  availableShiftsChanged = false;


  locationChanged = false;
});

var objInstance;
var preferredWorkLocation;
var locationChanged;

var availableStartDate;
var availableStartDateChanged;

var availableShifts;
var availableShiftsChanged;



Template.employeeHireInfo.helpers({
  objInstance: function () {
    if (!objInstance){
      objInstance = new dType.objInstance(this, Contactables);
    }
    return objInstance;
  },
  editMode: function () {
    return editMode.get();
  },

  genderOptions: function () {
    return _.values(Enums.gender);
  },
  getGenderDisplayName: function (value) {
    var v = _.find(Enums.gender, function (g) {
     return g.value == value;
    });
    return v ? v.displayName : 'Not Set';
  },

  ethnicityOptions: function () {
    return _.values(Enums.ethnicity);
  },
  getEthnicityDisplayName: function (value) {
    var v = _.find(Enums.ethnicity, function (e) {
      return e.value == value;
    });
    return v ? v.displayName : 'Not Set';
  },

  datePickerOptions: function () {
    return {
      format: "D, MM dd, yyyy",
      minViewMode: "days",
      startView: "months"
    }
  },

  daysOptions: function () {
    var array = [];
    _.each(moment.weekdays(), function (day, index) {
      array.push({
        displayName: day,
        value: index,
        isChecked: availableStartDate[index]
      });
    });
    return array;
  },
  availableStartDateChanged: function () {
    return function (value, isChecked) {
      availableStartDateChanged = true;
      availableStartDate[value] = isChecked;
    }
  },
  getAvailableStartDateDisplay: function () {
    var contactable = Contactables.findOne(Session.get('entityId'));

    var availableStartDate =  contactable && contactable.Employee && contactable.Employee.availableStartDate;
    var result = '';
    if (availableStartDate) {
      var dayNames = moment.weekdays();
      _.each(availableStartDate, function (v, k) {
        k = parseInt(k);
        if (v) {
          result += (result ? ', ' : '' ) + dayNames[k];
        }
      });
    }
    return result || 'none';
  },

  shiftsOptions: function () {
    var array = [];
    _.each(['1st shift', '2nd shift', '3rd shift'], function (name, index) {
      array.push({
        displayName: name,
        value: index + 1,
        isChecked: availableShifts[index + 1]
      });
    });
    return array;
  },
  availableShiftsChanged: function () {
    return function (value, isChecked) {
      availableShiftsChanged = true;
      availableShifts[value] = isChecked;
    }
  },
  getAvailableShiftsDisplay: function () {
    var contactable = Contactables.findOne(Session.get('entityId'));

    var availableShifts =  contactable && contactable.Employee && contactable.Employee.availableShifts;
    var result = '';
    if (availableShifts) {
      var shiftNames = ['1st', '2nd', '3rd'];
      _.each(availableShifts, function (v, k) {
        k = parseInt(k);
        k = k-1;
        if (v) {
          result += (result ? ', ' : '' ) + shiftNames[k];
        }
      });
    }
    if (result){
      result = result + ' shifts'
    }
    return result || 'none';
  },

  locationChanged: function () {
    return function (value) {
      locationChanged = true;
      preferredWorkLocation = value;
    }
  },
  preferredLocationDisplayName: function () {
    var contactable = Contactables.findOne(Session.get('entityId'));
    var location =  contactable && contactable.Employee && contactable.Employee.preferredWorkLocation;
    if (!location)return '';

    return location.address + ', ' + location.city + ', ' + location.country;
  }
});

Template.employeeHireInfo.events({
  'click #edit-mode': function () {
    editMode.set(!editMode.get());
  },
  'click #save-details': function () {
    if (!objInstance.validate()) {
      objInstance.showErrors();
      return;
    }

    var update = objInstance.getUpdate();
    if (!update.$set) return;

    if (locationChanged){
      update.$set['Employee.preferredWorkLocation'] = preferredWorkLocation;
    }

    if (availableStartDateChanged){
      update.$set['Employee.availableStartDate'] = availableStartDate;
    }

    if (availableShiftsChanged){
      update.$set['Employee.availableShifts'] = availableShifts;
    }


    if (!_.isObject(update.$set) || _.isEmpty(update.$set)) return;

    Contactables.update(Session.get('entityId'), update);
    editMode.set(false);
  }
});


Template.select.helpers({
  isSelected:  function (value) {
    return value == Template.instance().data.value;
  }
});

Template.checkboxGroup.events({
  'change .group-checkbox': function (e, ctx) {
    _.isFunction(ctx.data.onChange) && ctx.data.onChange(this.value, e.target.checked);
  }
});