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
    self.objTypeSelected = ko.observable(objType());

    var entitiesQuery = {};
    if (self.objTypeSelected())
        entitiesQuery = {
            objNameArray: {
                $in: [self.objTypeSelected().objName]
            }
        }
    objType.subscribe(function (newValue) {
        //        debugger;
        self.objTypeSelected(objType());

        entitiesQuery = {};
        if (self.objTypeSelected())
            entitiesQuery = {
                objNameArray: {
                    $in: [self.objTypeSelected().objName]
                }
            }
        self.entities(ko.mapping.fromJS(Contactables.find(entitiesQuery).fetch())());

        var filter = {
            objGroupType: Enums.objGroupType.contactable
        };
        if (self.objTypeSelected() != undefined)
            filter.objName = self.objTypeSelected().objName;

        var result = ObjTypes.find(filter).fetch();

        self.contactableTypes(result);
    });
    self.entities = ko.meteor.find(Contactables, entitiesQuery);

    self.contactableTypes = ko.observableArray();

    Meteor.subscribe('objTypes', function () {
        self.getIconForObjName = function (objname) {
            var type = ObjTypes.findOne({
                objName: objname
            });
            return 'glyphicon ' + type.glyphicon;
        };

        var filter = {
            objGroupType: Enums.objGroupType.contactable
        };
        if (self.objTypeSelected != undefined)
            filter.objName = self.objTypeSelected.objName;

        var result = ObjTypes.find(filter).fetch();

        self.contactableTypes(result);
        _.extend(self, helper.createObjTypefilter(['person.firstName', 'person.lastName', 'organization.organizationName'], result,
            function () {
                self.entities(ko.mapping.fromJS(Contactables.find(this.query).fetch())());
            }));
        self.ready(true);
    });

    self.showAddContactableModal = function (typeId) {
        Session.set('newContactableTypeId', typeId);
        $('#addContactableModal').modal('show');
    };
    return self;
};