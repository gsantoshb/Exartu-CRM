var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
  objType: '',
  tags: [],
  statuses: [],
  limit: 20
}));

JobsController = RouteController.extend({
  template: 'jobs',
  layoutTemplate: 'mainLayout',
  action: function () {
    if (this.isFirstRun == false) {
      this.render();
      return;
    }

    var type = this.params.hash || this.params.type;
    if (type != undefined && type != 'all') {
      var re = new RegExp("^" + type + "$", "i");
      filters().objType(dType.ObjTypes.findOne({
        name: re
      }));
    } else {
      filters().objType(undefined);
    }

    this.render('jobs');
  },
  onAfterAction: function() {
    var title = 'Jobs',
      description = 'All your jobs are here';
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

Template.jobs.config = {
  singleton: true
}

Template.jobs.waitOn = ['JobHandler', 'LookUpsHandler', 'ObjTypesHandler'];

Template.jobs.viewModel = function () {
  var self = {};
  self.ready = ko.observable(false);

  self.filesCollection = ContactablesFS;

  // Filters
  self.lookFilters = [
//    {
//      name: 'jobIndustry',
//      title: 'Industries',
//      fieldName: 'industry'
//    },
//    {
//      name: 'jobCategory',
//      title: 'Categories',
//      fieldName: 'category'
//    },
    {
      name: 'jobStatus'
      , title: 'Statuses',
      fieldName: 'status'
    },
//    {
//      name:'jobDuration',
//      title: 'Durations',
//      fieldName: 'duration'
//    }
  ];

  self.status=[]
  _.each(_.keys(Enums.jobStatus),function(key){
    self.status.push({
      displayName: Enums.jobStatus[key],
      isSelected: ko.observable(false),
    })
  })

  self.selectStatus=function(item){
    item.isSelected(!item.isSelected());
  }


  _.forEach(self.lookFilters, function(filter){

    filter.items = LookUps.find({
      codeType: Enums.lookUpTypes.job[filter.fieldName].code
    }).fetch();
    filter.selectedItems = ko.observableArray();
    filter.selectedItems.removeSelection = function(data) {
      filter.selectedItems.remove(data);
    }
  });

  // TODO: search by customer name
  var searchFields = ['categoryName', 'industryName', 'durationName', 'statusName', 'publicJobTitle'];
  self.searchString = ko.observable();

  var extendLookupFilterQuery = function (query, filter, fieldName) {
    if (filter().length > 0) {
      query[fieldName] = {
        $in: _.map(filter(), function(option){
            return option.id;
        })
      };
      GAnalytics.event("/jobs", "Search by " + fieldName);
    }
  }

  var query = ko.computed(function () {

    var q = {};
    var f = ko.toJS(filters);
    if (f.objType)
      q.objNameArray = f.objType.name;

    if (f.tags.length) {
      q.tags = {
        $in: f.tags
      };
      GAnalytics.event("/jobs", "Search by tags");
    }

    // Lookups filter
    _.forEach(self.lookFilters, function(filter){
      extendLookupFilterQuery(q, filter.selectedItems, filter.fieldName);
    });

    if (self.searchString()) {
      var searchQuery = [];
      _.each(searchFields, function (field) {
        var aux = {};
        aux[field] = {
          $regex: self.searchString(),
            $options: 'i'
        }
        searchQuery.push(aux);
      });
      q = {
        $and: [q, {
          $or: searchQuery
        }]
      };
      GAnalytics.event("/jobs", "Search by string");
    }
//    statusFilter
    _.each(self.status, function(item){
      if (item.isSelected()){
        _.extend(q, JobCalculatedStatus.getQuery(item.displayName));
      }
    })

    return q;
  });
  var options = ko.computed(function () {
    return {
      sort: { 'publicJobTitle': 1 },
      limit: ko.toJS(filters().limit)
    }
  })

  self.showMore = function () {
    filters().limit(filters().limit() + 20);
  }
  self.entities = ko.meteor.find(Jobs, query, options);

  self.jobTypes = ko.computed(function () {
    var q = {
      parent: Enums.objGroupType.job
    };
    var objType = ko.toJS(filters().objType);
    if (objType) {
      q.name = objType.name;
    };

    return dType.ObjTypes.find(q).fetch();
  });

  self.objName = ko.observable('Jobs');
  self.tags = filters().tags;
  self.tag = ko.observable();
  self.addTag = function () {
    filters().tags.push(self.tag());
    self.tag('');
  }

  $('#tag-filter').on('keypress', function(e) {
    if (e.keyCode == 13) {
      self.addTag();
      e.preventDefault();
    }
  });

  self.removeTag = function (tag) {
    filters().tags.remove(tag);
  };


  self.ready(true);

  return self;
};