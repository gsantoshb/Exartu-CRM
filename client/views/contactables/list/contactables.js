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
        this.render('contactables');
    },

});

Template.contactables.config = {
  singleton: true
}

Template.contactables.waitOn = ['ContactableHandler', 'ObjTypesHandler'];

Template.contactables.viewModel = function () {
    var self = {};
    var searchFields = ['person.firstName', 'person.lastName', 'person.middleName', 'organization.organizationName'];

  self.filesCollection = ContactablesFS;

    self.searchString = ko.observable();
    self.ready = ko.observable(false);
    self.includeInacives = filters().inactives;
    self.onlyRecent = ko.observable(false);
    self.tags = filters().tags;
    self.tag = ko.observable();
    self.selectedLimit = ko.observable();
    self.timeLimits = ko.observableArray([
        {
            name: 'day',
            time: 24 * 60 * 60 * 1000
        },
        {
            name: 'week',
            time: 7 * 24 * 60 * 60 * 1000
        },
        {
            name: 'month',
            time: 30 * 24 * 60 * 60 * 1000
        },
        {
            name: 'year',
            time: 365 * 24 * 60 * 60 * 1000
        }
    ]);

    var query = ko.computed(function () {
        var q = {};
        var f = ko.toJS(filters);
        if (f.objType)
            q.objNameArray = f.objType.name;

        if (f.tags.length) {
            q.tags = {
                $in: f.tags
            };
        }
        ;
        if (!f.inactives) {
            q.inactive = {
                $ne: true
            };
        }
        if (self.onlyRecent()) {
            //            debugger;
            var dateLimit = new Date();
            q.createdAt = {
                $gte: dateLimit.getTime() - self.selectedLimit()
            };
        }
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
        }
        return q;
    });

    var options = ko.computed(function () {
        return {
            limit: ko.toJS(filters().limit),
            sort: { createdAt: -1 }
        }
    })

    self.showMore = function () {
        filters().limit(filters().limit() + 20);
    }

    self.entities = ko.meteor.find(Contactables, query, options);

    var objTypesQuery = ko.computed(function () {

        var q = {
            parent: Enums.objGroupType.contactable
        };
        var objType = ko.toJS(filters().objType);
        if (objType) {
            q.name = objType.name;
        }
        return q;
    });
  self.contactableTypes = ko.meteor.find(dType.ObjTypes, objTypesQuery);

    self.name = ko.computed(function () {
        if (filters().objType()) {
            return filters().objType().name + 's';
        }
        return 'Contactables';
    });

    self.addTag = function () {
        filters().tags.push(self.tag());
        self.tag('');
    };

    self.removeTag = function (tag) {
        filters().tags.remove(tag);
    };

    self.ready(true);

    self.showAddContactableModal = function (typeId) {
        Session.set('newContactableTypeId', typeId);
        $('#addContactableModal').modal('show');
    };
    return self;
};