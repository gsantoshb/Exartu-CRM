var objType = ko.observable();
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
            objType(ObjTypes.findOne({
                objName: re
            }));
        } else {
            objType(undefined);
        }
        this.render('contactables');
    },
    waitOn: function () {
        return [Meteor.subscribe('contactables'), Meteor.subscribe('objTypes')];
    },
});
Template.contactables.waitOn = 'ContactableHandler';

Template.contactables.viewModel = function () {
    //    debugger;
    var self = {};
    self.ready = ko.observable(false);
    self.entities = ko.observableArray();
    self.contactableTypes = ko.observableArray();
    self.objName = ko.observable('Contactables');
    var selectObjType = function (newValue) {
        var entitiesQuery = {};
        var filter = {
            objGroupType: Enums.objGroupType.contactable
        };
        if (newValue) {
            entitiesQuery = {
                objNameArray: {
                    $in: [newValue.objName]
                }
            }
            self.entities(ko.mapping.fromJS(Contactables.find(entitiesQuery).fetch())());
            filter.objName = newValue.objName;
            self.objName(newValue.objName)
        } else {
            self.objName('Contactables')
        }


        var result = ObjTypes.find(filter).fetch();

        self.contactableTypes(result);

    }
    selectObjType(objType());

    objType.subscribe(selectObjType);

    self.getIconForObjName = function (objname) {
        var type = ObjTypes.findOne({
            objName: objname
        });
        return 'glyphicon ' + type.glyphicon;
    };
    //    _.extend(self, helper.createObjTypefilter(['person.firstName', 'person.lastName', 'organization.organizationName'], result,
    //        function () {
    //            console.log('query', this.query);
    //            self.entities(ko.mapping.fromJS(Contactables.find(this.query).fetch())());
    //        }));

    self.ready(true);

    self.showAddContactableModal = function (typeId) {
        Session.set('newContactableTypeId', typeId);
        $('#addContactableModal').modal('show');
    };
    return self;
};