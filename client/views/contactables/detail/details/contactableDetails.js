Template.contactableDetails.waitOn = ['ObjTypesHandler', 'ContactableHandler', 'GoogleMaps'];
Template.contactableDetails.viewModel = function () {
//    debugger;
    var self={},
        entityId = Session.get('entityId');
    self.contactable = ko.meteor.findOne(Contactables, {
        _id: entityId
    });

    // <editor-fold desc="****** EDIT  ******">

    self.updateContactable = function (options, callback) {
//        debugger;
        if (!options.objUpdated.isValid()) {
            options.objUpdated.errors.showAllMessages();
            return;
        }

        var toJSObj = ko.toJS(options.objUpdated());
        _.forEach(_.keys(toJSObj), function (key) {
            if (_.isFunction(toJSObj[key]))
                delete toJSObj[key];
        });

        var set = {};
        set['$set'] = {};
        _.each(_.keys(toJSObj),function(key){
            set['$set'][options.objNameUpdated + '.' + key] = toJSObj[key];
        })


        Contactables.update({
            _id: self.contactable()._id()
        }, set, function (err, result) {
            if (!err)
                callback.call();
        });
    };

    // Edit contactable's general information (person or organization details)

    self.editModeContactableInfo = ko.observable(false);




    self.editModeContactableInfo.subscribe(function (value) {
        if (!value) {
            if (self.editOrganization)
                self.editOrganization().load(self.contactable().organization);
            else
                self.editPerson().load(self.contactable().person);
        }
    });

    if (self.contactable().person) {
        self.editPerson = ko.validatedObservable(new koPerson());
        self.editPerson().load(self.contactable().person);
    }

    if (self.contactable().organization) {
        self.editOrganization = ko.validatedObservable(new koOrganization());
        self.editOrganization().load(self.contactable().organization);
    }

    self.updateContactableInformation = function () {
        var options = {};

        if (self.editOrganization) {
            options.objUpdated = self.editOrganization;
            options.objNameUpdated = 'organization';
        } else {
            options.objUpdated = self.editPerson;
            options.objNameUpdated = 'person';
        }

        self.updateContactable(options, function () {
            self.editModeContactableInfo(false);
        })
    };

    // Edit objType

    self.editModeContactableObjType = ko.observable(false);
    self.editModeContactableObjType.subscribe(function (value) {
        if (!value)
            self.editObjType().load(self.contactable()[self.contactable().objNameArray()[0]]);
    });

    var objType = ObjTypes.findOne({
        objName: self.contactable().objNameArray()[0]
    });

    self.editObjType = ko.validatedObservable(koObjectGenerator(objType.fields));
    self.editObjType().load(self.contactable()[self.contactable().objNameArray()[0]]);

    self.updateContactableObjType = function () {
        var options = {
            objUpdated: self.editObjType,
            objNameUpdated: self.contactable().objNameArray()[0]
        }

        self.updateContactable(options, function () {
            self.editModeContactableObjType(false);
        });
    };
    // </editor-fold>

    // <editor-fold desc="****** LOCATION  ******">
    var geocoder = new google.maps.Geocoder();
    self.editModeLocation = ko.observable(false);

    self.editModeLocation.subscribe(function (value) {
        self.editLocation(ko.toJS(self.contactable().location));
    });

    self.editLocation = ko.observable(ko.toJS(self.contactable().location));
    self.edit = function () {
        self.editModeLocation(!self.editModeLocation());
    }
    self.locationString = ko.observable((!self.contactable().location || (_.isFunction(self.contactable().location) && self.contactable().location() == null ))? '' : self.contactable().location.formatted_address());
    self.findLocation = function () {
        //        debugger;
        geocoder.geocode({
            address: self.locationString(),
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
//                                debugger;

                aux = results[0];
                self.editLocation(aux);
            } else {
                self.editLocation(null);
            }
        })
    };
    self.saveLocation = function () {
        //        debugger;
        var location = self.editLocation();
        if (location){
            if (!location.coords)
                location.coords = helper.getCoords(location)
            removeExtrangePrototypes(location);
        }
//        debugger;

        Contactables.update({
            _id: entityId
        }, {
            $set: {
                location: ko.toJS(self.editLocation)
            }
        }, function (err) {

            if (!err) {
                self.editModeLocation(false);
            } else {
                console.log(err);
            }
        });
    }
    // </editor-fold>

    self.getTemplateName = function (data) {
        if (data.Employee) return 'employee-template';
        if (data.Customer) return 'customer-template';
        if (data.Contact) return 'contact-template';
    }

    return self;
}
var objProto = {}.__proto__;
var removeExtrangePrototypes = function (obj) {
    if (_.isObject(obj)) {
        if (obj.__proto__ != objProto) {
            obj.__proto__ = objProto;
        }
        _.each(_.keys(obj), function (key) {
            removeExtrangePrototypes(obj[key])
        });
    } else if (_.isArray(obj)) {
        _.each(obj, removeExtrangePrototypes);
    }
}