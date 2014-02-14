var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
    objType: '',
    tags: [],
    statuses: []
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
    },
});

Template.jobs.waitOn = 'JobHandler';

Template.jobs.viewModel = function () {
    var self = {};
    self.ready = ko.observable(false);

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

        return q;
    });

    self.entities = ko.meteor.find(Jobs, query);

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

    self.ready(true);

    return self;
};