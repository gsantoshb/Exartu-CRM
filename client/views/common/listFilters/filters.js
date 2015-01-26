// Entity type
Template.filter_entityType.helpers({
  typeOptionClass: function (option) {
    var selectedType = UI._parentData(1).selected;
    return selectedType.value == option.name ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
  }
});

Template.filter_entityType.events = {
  'click .typeSelect': function() {
    var selectedType = UI._parentData(0).selected;
    if (selectedType.value == this.name){
      selectedType.value = null;
    } else {
      selectedType.value = this.name;
    }
    selectedType.dep.changed();
  }
};


// LookUp
Template.filter_lookUp.helpers({
  cb: function () {
    var self = this;
    return function (lookUpId) {
      self.lookUpValue.value = lookUpId;
    }
  }
});


// Inactive
Template.filter_inactive.helpers({
  showInactive: function () {
    return this.showInactive.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
  }
});

Template.filter_inactive.events = {
  'click #show-inactives': function() {
    this.showInactive.value = !this.showInactive.value;
  }
};

// CreatedDate
var timeLimits = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};
var dayISO,weekISO,monthISO,yearISO
dayISO=moment().subtract(1, 'day');
weekISO=moment().subtract(1, 'week');
monthISO=moment().subtract(1, 'month');
yearISO=moment().subtract(1, 'year');
var timeLimitsISO= {
  day: dayISO,
  week: weekISO,
  month: monthISO,
  year: yearISO
}
var setDateCreatedFilter = function(value) {
  if (this.selectedLimit.value == value)
    this.selectedLimit.value = undefined;
  else
    this.selectedLimit.value = value;
};


Template.filter_dateCreated.helpers({
  recentOptions: function () {
    return timeLimits;
  },
  recentOptionClass: function (option) {
    return this.selectedLimit.value == option ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
  }
});
Template.filter_dateCreatedISO.helpers({
  recentOptionsISO: function () {
    return timeLimitsISO;
  },
  recentOptionClass: function (option) {
    return this.selectedLimit.value == option ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
  }
});

Template.filter_dateCreated.events = {
  'click #recent-day': function() {
    setDateCreatedFilter.call(this, timeLimits.day);
  },
  'click #recent-week': function() {
    setDateCreatedFilter.call(this, timeLimits.week);
  },
  'click #recent-month': function() {
    setDateCreatedFilter.call(this, timeLimits.month);
  },
  'click #recent-year': function() {
    setDateCreatedFilter.call(this, timeLimits.year);
  }
};
Template.filter_dateCreatedISO.events = {
  'click #recent-day': function() {
    setDateCreatedFilter.call(this, timeLimitsISO.day);
  },
  'click #recent-week': function() {
    setDateCreatedFilter.call(this, timeLimitsISO.week);
  },
  'click #recent-month': function() {
    setDateCreatedFilter.call(this, timeLimitsISO.month);
  },
  'click #recent-year': function() {
    setDateCreatedFilter.call(this, timeLimitsISO.year);
  }
};


// Tags
var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(this.tags.value, inputTag.value) != -1)
    return;

  this.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};
Template.filter_tags.events = {
  'click .add-tag': function() {
    addTag.call(this);
  },
  'keypress #new-tag': function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag.call(this);
    }
  },
  'click .remove-tag': function() {
    var tags = UI._parentData(0).tags;
    tags.remove(this.value);
  },
  'click .focusAddTag': function(){
    $('#new-tag')[0].focus();
  }
};


// Created By
Template.filter_createdBy.helpers({
  showMineOnly: function () {
    return this.showMineOnly.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
  }
});

Template.filter_createdBy.events = {
  'click #show-mineOnly': function() {
    this.showMineOnly.value = !this.showMineOnly.value;
  }
};