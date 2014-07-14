var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
  objType: '',
  tags: [],
  statuses: [],
  inactives: false,
  limit: 20
}));

ContactablesController = RouteController.extend({
  template: 'contactables',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, ContactableHandler, AssignmentsHandler];
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    if (this.isFirstRun == false) {
      this.render();
      return;
    }
    var type = this.params.hash || this.params.type;
      console.log('type',type);
    if (type != undefined && type != 'all') {
      var re = new RegExp("^" + type + "$", "i");
      var objType = dType.ObjTypes.findOne({
        name: re
      });
      query.objType.value = objType.name;
      info.objType.value = objType.name+'s';
    } else {
      query.objType.value = undefined;
      info.objType.value = 'record';
    }
    this.render('contactables');
  },
  onAfterAction: function() {
    var title = 'My Network',
      description = 'All your contacts are here';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var timeLimits = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    contactablesCount: {},
    objType: {},
    isRecentDaySelected: {
      default: false
    },
    objTypeDisplayName: {},
    isRecentWeekSelected: {
      default: false
    },
    isRecentMonthSelected: {
      default: false
    },
    isRecentYearSelected: {
      default: false
    },
    isFiltering: {
      default: false
    }
  }
});

var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {},
    objType: {},
    inactives: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    onlyRecents: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    selectedLimit: {
      default: timeLimits.day
    },
    tags: {
      type: Utils.ReactivePropertyTypes.array
    },
    limit: {
      default: 15
    }
  }
});

// List

Template.contactablesList.info = function() {
  info.isFiltering.value = Contactables.find().count() != 0;
  console.dir(info)
  return info;
};

Template.contactablesListSearch.contactableTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};

Template.contactablesListSearch.resumeParserRestrictions = function() {
  return [SubscriptionPlan.plansEnum.enterprise];
};

Template.contactablesList.contactables = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  if (!_.isEmpty(query.searchString.value)) {
    var searchStringQuery = [];
    _.each([
      // organization
      'organization.organizationName', 'organization.department',
      // person
      'person.firstName', 'person.lastName', 'person.jobTitle',
      // contactable
      'tags', 'searchKey'
    ], function (field) {
      var aux = {};
      aux[field] = {
          $regex: query.searchString.value,
          $options: 'i'
      };
      searchStringQuery.push(aux);
    });
    searchQuery.$or =  searchStringQuery;
    GAnalytics.event("/contactables", "Search by string");
  }

  if (query.onlyRecents.value) {
    var dateLimit = new Date();
    searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - query.selectedLimit.value
    };
  }

  if (query.inactives.value) {
    searchQuery.inactive = {
        $ne: true
    };
  }

  if (query.tags.value.length > 0) {
    searchQuery.tags = {
      $in: query.tags.value
    };
  }

  var contactables = Contactables.find(searchQuery, {limit: query.limit.value});


  return contactables;
};

// All

Template.contactables.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.contactablesCount.value = Contactables.find(searchQuery).count();

  return info;
};

Template.contactables.showMore = function() {
  return function() { query.limit.value = query.limit.value + 15 };
};

// List search

Template.contactablesList.contactableTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};

Template.contactablesListSearch.searchString = function() {
  return query.searchString;
};

// List filters

Template.contactablesFilters.query = function () {
  return query;
};

Template.contactablesFilters.recentOptions = function() {
  return timeLimits;
};

Template.contactablesFilters.recentOptionClass = function(option) {
  return query.selectedLimit.value == option? 'btn btn-xs btn-primary' : 'btn btn-xs btn-default';
};

Template.contactablesFilters.tags = function() {
  return query.tags;
};

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(query.tags.value, inputTag.value) != -1)
    return;

  query.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};

Template.contactablesFilters.events = {
  'click .add-tag': function() {
    addTag();
  },
  'keypress #new-tag': function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag();
    }
  },
  'click .remove-tag': function() {
    query.tags.remove(this.value);
  },
  'click .focusAddTag': function(){
    $('#new-tag')[0].focus();
  },
  'click #recent-day': function(e) {
    query.selectedLimit.value = timeLimits.day;
  },
  'click #recent-week': function(e) {
    query.selectedLimit.value = timeLimits.week;
  },
  'click #recent-month': function(e) {
    query.selectedLimit.value = timeLimits.month;
  },
  'click #recent-year': function(e) {
    query.selectedLimit.value = timeLimits.year;
  }
};

// Item
Template.contactablesListItem.pictureUrl = function(pictureFileId) {
  var picture = ContactablesFS.findOne({_id: pictureFileId});
  return picture? picture.url('ContactablesFSThumbs') : undefined;
};

Template.contactablesListItem.contactableIcon = function() {
  return helper.getEntityIcon(this);
};

Template.contactablesListItem.displayObjType = function() {
  if (this.Customer)
    return 'Customer';
  if (this.Employee)
    return 'Employee';
  if (this.Contact)
    return 'Contact';
};

// Employee item
Template.employeeInformation.assignmentInfo = function () {
  if (!this.assignment)
    return undefined;

  var assignmentInfo = {};
  var assignment = Assignments.findOne({_id: this.assignment});

  var job = Jobs.findOne({
    _id: assignment.job
  }, {
    transform: null
  });

  var customer = Contactables.findOne({_id: job.customer}, {transform: null});

  assignmentInfo.job = job._id;
  assignmentInfo.jobTitle = job.publicJobTitle;
  if (customer) {
    assignmentInfo.customerName = customer.organization.organizationName;
    assignmentInfo.customer = customer._id;
  }

  return assignmentInfo;
}

// Google analytic

_.forEach(['employeeInformation', 'contactInformation', 'customerInformation'],
  function(templateName){
    Template[templateName]._events = Template[templateName]._events || [];
    Template[templateName]._events.push({
      events: 'click',
      handler: function() {
        GAnalytics.event("/contactables", "quickAccess", templateName);
      },
    });
});

