var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
    objType: '',
    tags: [],
    statuses: [],
    inactives: false
}));

ContactablesController = RouteController.extend({
    template: 'contactables',
    layoutTemplate: 'mainLayout',
    action: function () {
        //        debugger;
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
        this.render('contactables');
    },

});
Template.contactables.waitOn = 'ContactableHandler';

Template.contactables.viewModel = function () {
    var self = {};
    var searchFields = ['person.firstName', 'person.lastName', 'person.middleName', 'organization.organizationName'];
    self.searchString = ko.observable();
    self.ready = ko.observable(false);
    self.includeInacives = filters().inactives;
    self.tags = filters().tags;
    self.tag = ko.observable();

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
        if (!f.inactives) {
            q.inactive = {
                $ne: true
            };
        }
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

    self.entities = ko.meteor.find(Contactables, query);

    self.contactableTypes = ko.computed(function () {
        var q = {
            objGroupType: Enums.objGroupType.contactable
        };
        var objType = ko.toJS(filters().objType);
        if (objType) {
            q.objName = objType.objName;
        };
        //                console.log('fetching objtypes ');
        //                console.dir(q);
        return ObjTypes.find(q).fetch();
    });
    self.objName = ko.computed(function () {
        if (filters().objType()) {
            return filters().objType().objName + 's';
        }
        return 'Contactables';
    });

    self.addTag = function () {
        filters().tags.push(self.tag());
        self.tag('');
    }


    self.ready(true);

    self.showAddContactableModal = function (typeId) {
        Session.set('newContactableTypeId', typeId);
        $('#addContactableModal').modal('show');
    };
    return self;
};