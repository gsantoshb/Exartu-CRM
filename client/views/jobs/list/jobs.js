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
            filters().objType(ObjTypes.findOne({
                objName: re
            }));
        } else {
            filters().objType(undefined);
        }

        this.render('jobs');
    }
});

Template.jobs.waitOn = 'JobHandler';

Template.jobs.viewModel = function () {
    var self = {};
    self.ready = ko.observable(false);

    // Filters 
    var extendFilters = function (items) {
        _.forEach(items, function (item) {
            _.extend(item, {
                value: ko.observable(false)
            })
        });
    };

    self.industries = LookUps.findOne({
        name: 'jobIndustry'
    }, {
        _id: 0,
        items: 1
    }).items;
    extendFilters(self.industries);

    self.categories = LookUps.findOne({
        name: 'jobCategory'
    }, {
        _id: 0,
        items: 1
    }).items;
    extendFilters(self.categories);

    self.durations = LookUps.findOne({
        name: 'jobDuration'
    }, {
        _id: 0,
        items: 1
    }).items;
    extendFilters(self.durations);

    self.statuses = LookUps.findOne({
        name: 'jobStatus'
    }, {
        _id: 0,
        items: 1
    }).items;
    extendFilters(self.statuses);

    // TODO: search by customer name
    var searchFields = ['categoryName', 'industryName', 'durationName', 'statusName', 'publicJobTitle'];
    self.searchString = ko.observable();

    var extendLookupFilterQuery = function (query, filter, fieldName) {
        var filterBy = [];
        _.forEach(filter, function (item) {
            if (item.value())
                filterBy.push(item.code);
        })
        if (filterBy.length > 0)
            query[fieldName] = {
                $in: filterBy
            };
    }

    var query = ko.computed(function () {

        var q = {};
        var f = ko.toJS(filters);
        if (f.objType)
            q.objNameArray = f.objType.objName;

        if (f.tags.length) {
            q.tags = {
                $in: f.tags
            };
        };

        // Lookups filter
        extendLookupFilterQuery(q, self.industries, 'industry');
        extendLookupFilterQuery(q, self.categories, 'category');
        extendLookupFilterQuery(q, self.durations, 'duration');
        extendLookupFilterQuery(q, self.statuses, 'status');

        if (self.searchString()) {
            var searchQuery = [];
            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: self.searchString()
                }
                searchQuery.push(aux);
            });
            q = {
                $and: [q, {
                    $or: searchQuery
                }]
            };
        }

        return q;
    });
    var options=ko.computed(function(){
        return {limit: ko.toJS(filters().limit)}
    })

    self.showMore=function(){
        filters().limit(filters().limit()+20);
    }
    self.entities = ko.meteor.find(Jobs, query, options);

    self.jobTypes = ko.computed(function () {
        var q = {
            objGroupType: Enums.objGroupType.job
        };
        var objType = ko.toJS(filters().objType);
        if (objType) {
            q.objName = objType.objName;
        };

        return ObjTypes.find(q).fetch();
    });

    self.objName = ko.observable('Jobs');
    self.tags = filters().tags;
    self.tag = ko.observable();
    self.addTag = function () {
        filters().tags.push(self.tag());
        self.tag('');
    }
    self.removeTag = function (tag) {
        filters().tags.remove(tag);
    };


    self.ready(true);

    return self;
};