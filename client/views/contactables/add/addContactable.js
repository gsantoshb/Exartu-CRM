Template.addContactable.viewModel = function (objname) {
    var self = this;

    var myPerson = new koPerson();
    var myOrg = new koOrganization();

    var options = {
        self: self,
        extendEntity: function (self) {
            // Extend contactable with person or organization, this can be changed by the user
            var geocoder = new google.maps.Geocoder();

            self.locationString = ko.observable();
            self.findLocation = function () {
                geocoder.geocode({
                    address: self.locationString(),
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        self.location(results[0]);
                    } else {
                        self.location(null);
                    }
                })
            };
            self.location = ko.observable(null);
            self.selectedType = ko.observable();
            self.setSelectedType = function (val) {
                switch (val) {
                    case Enums.personType.human:
                        _.extend(self.entity(), {
                            person: myPerson
                        });
                        if (self.entity().organization) {
                            self.entity().organization = null;
                        }
                        break;
                    case Enums.personType.organization:
                        _.extend(self.entity(), {
                            organization: myOrg
                        });
                        if (self.entity().person) {
                            self.entity().person = null;
                        }
                        break;
                }
            };
            self.selectedType.subscribe(function (newval) {
                self.setSelectedType(newval);
            });
            //            debugger;
            self.selectedType(ObjTypes.findOne({
                objName: self.objTypeName()
            }).personType);
            self.canAdd = ko.observable(true);

            return self;
        },
        objname: objname,
        addCallback: function (contactable) {
            debugger;
            self.canAdd(false);
            var cont = ko.toJS(contactable);
            if (self.location()){
                cont.location = ko.toJS(self.location);
                cont.location.coords = helper.getCoords(cont.location);
            }
            Meteor.call('addContactable', cont, function (err, result) {
                self.canAdd(true);
                if (err)
                    console.log(err);
                else
                    $('#addContactableModal').modal('hide');
            });
        }
    }

    helper.addExtend(options);

    return self;

    //    var myPerson = new koPerson();
    //    var myOrg = new koOrganization();
    //
    //    var objType = ObjTypes.findOne({
    //        objName: objname
    //    });
    //
    //    self.objTypeName = objType.objName;
    //    self.ready = ko.observable(false);
    //
    //    // Extend contactable with person or organization, this can be changed by the user
    //    self.selectedType = ko.observable();
    //    self.setSelectedType = function (val) {
    //        switch (val) {
    //        case Enums.personType.human:
    //            _.extend(self.contactable(), {
    //                person: myPerson
    //            });
    //            if (self.contactable().organization) {
    //                self.contactable().organization = null;
    //            }
    //            break;
    //        case Enums.personType.organization:
    //            _.extend(self.contactable(), {
    //                organization: myOrg
    //            });
    //            if (self.contactable().person) {
    //                self.contactable().person = null;
    //            }
    //            break;
    //        }
    //    };
    //    self.selectedType.subscribe(function (newval) {
    //        self.setSelectedType(newval);
    //    });
    //    self.selectedType(objType.personType);
    //
    //    // GENERIC
    //
    //    // Extend objType fields with validations
    //    _.forEach(objType.fields, function (item) {
    //        _.extend(item, {
    //            value: ko.observable().extend({
    //                pattern: {
    //                    message: 'invalid value',
    //                    params: item.regex
    //                }
    //            })
    //        });
    //        if (item.fieldType == Enums.fieldType.lookUp) {
    //            _.extend(item, {
    //                value: item.multiple ? ko.observableArray(item.defaultValue) : ko.observable(item.defaultValue),
    //                options: LookUps.findOne({
    //                    name: item.lookUpName
    //                }).items,
    //            })
    //        }
    //    });
    //
    //    // Generate observableValidate with objType's fields.
    //    var entityObj = {};
    //    entityObj.objFields = ko.observableArray(objType.fields);
    //    self.entity = ko.validatedObservable(entityObj);
    //
    //    // Get objType relations
    //    self.relations = ko.observableArray([]);
    //    Meteor.call('getShowInAddRelations', objType.objName, function (err, result) {
    //        _.each(result, function (r) {
    //            self.relations.push({
    //                relation: r,
    //                data: ko.meteor.find(window[r.target.collection], r.target.query),
    //                value: ko.observable(null)
    //            });
    //        })
    //
    //        self.ready(true);
    //    });
    //
    //    self.addContactable = function () {
    //        if (!self.contactable.isValid()) {
    //            self.contactable.errors.showAllMessages();
    //            return;
    //        };
    //        var relNames = _.map(self.relations(), function (r) {
    //            return r.relation.name;
    //        });
    //        var relValues = _.map(self.relations(), function (r) {
    //            if (r.value()) return r.value()._id();
    //        });
    //        _.extend(self.contactable(), _.object(relNames, relValues));
    //
    //        var fields = self.contactable()[self.objTypeName()]();
    //        delete self.contactable()[self.objTypeName()];
    //        self.contactable()[self.objTypeName()] = {};
    //        _.forEach(fields, function (field) {
    //            self.contactable()[self.objTypeName()][field.name] = field.value() == null ? field.defaultValue : field.value();
    //        });
    //        Meteor.call('addContactable', ko.toJS(self.contactable), function (err, result) {
    //            console.log(err);
    //        });
    //        $('#addContactableModal').modal('hide');
    //    };
    //
    //    return this;
}

Meteor.methods({
    addContactable: function (contactable) {
        contactable.hierId = Meteor.user().hierId;
        Contactables.insert(contactable);
    }
});