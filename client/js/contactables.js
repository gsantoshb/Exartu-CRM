var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
    objType: '',
    tags: [],
    statuses: []
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
        //        console.log(this.isFirstRun)
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

        //        console.log('fetching entities');
        //        console.dir(q);
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
    self.objName = ko.observable('Contactables');
    self.tags = filters().tags;
    self.tag = ko.observable();
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