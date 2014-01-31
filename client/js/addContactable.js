Template.addContactable.viewmodel = function (objname) {
    var self = this;
    var myPerson = new koPerson();
    var myOrg = new koOrganization();
    var objType = ObjTypes.findOne({
        objName: objname
    });
    var aux = {
        objNameArray: ko.observableArray([objType.objName])
    };
    self.contactable = ko.validatedObservable(aux);
    self.objTypeName = ko.observable(objType.objName);
    self.ready = ko.observable(false);

    self.selectedType = ko.observable();
    self.setSelectedType = function (val) {
        switch (val) {
        case Enums.personType.human:
            _.extend(self.contactable(), {
                person: myPerson
            });
            if (self.contactable().organization) {
                self.contactable().organization = null;
            }
            break;
        case Enums.personType.organization:
            _.extend(self.contactable(), {
                organization: myOrg
            });
            if (self.contactable().person) {
                self.contactable().person = null;
            }
            break;
        }
    };

    self.selectedType.subscribe(function (newval) {
        self.setSelectedType(newval);
    });
    self.selectedType(objType.personType);

    _.forEach(objType.fields, function (item) {
        _.extend(item, {
            value: ko.observable().extend({
                pattern: {
                    message: 'invalid value',
                    params: item.regex
                }
            })
        });
        if (item.fieldType == Enums.fieldType.lookUp) {
            _.extend(item, {
                value: item.multiple ? ko.observableArray(item.defaultValue) : ko.observable(item.defaultValue),
                options: LookUps.findOne({
                    name: item.lookUpName
                }).items,
            })
        }
    });

    self.selectedType.subscribe(function (newval) {
        self.setSelectedType(newval);
    });


    aux[objType.objName] = ko.observableArray(objType.fields)


    //    self.setSelectedType(self.selectedType());

    //relations
    self.relations = ko.observableArray([]);
    Meteor.call('getShowInAddRelations', objType.objName, function (err, result) {
        _.each(result, function (r) {
            self.relations.push({
                relation: r,
                data: ko.meteor.find(window[r.target.collection], r.target.query),
                value: ko.observable(null)
            });
        })

        self.ready(true);
    });

    self.addContactable = function () {
        if (!self.contactable.isValid()) {
            self.contactable.errors.showAllMessages();
            return;
        };
        var relNames = _.map(self.relations(), function (r) {
            return r.relation.name;
        });
        var relValues = _.map(self.relations(), function (r) {
            if (r.value()) return r.value()._id();
        });
        _.extend(self.contactable(), _.object(relNames, relValues));

        var fields = self.contactable()[self.objTypeName()]();
        delete self.contactable()[self.objTypeName()];
        self.contactable()[self.objTypeName()] = {};
        _.forEach(fields, function (field) {
            self.contactable()[self.objTypeName()][field.name] = field.value() == null ? field.defaultValue : field.value();
        });
        Meteor.call('addContactable', ko.toJS(self.contactable), function (err, result) {
            console.log(err);
        });
        $('#addContactableModal').modal('hide');
    }
    return this;
}

Meteor.methods({
    addContactable: function (contactable) {
        Contactables.insert(contactable);
    }
});