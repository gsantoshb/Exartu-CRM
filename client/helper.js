var colors = [
    {
        name: 'red',
        value: '#ff2d55'
    },
    {
        name: 'yellow',
        value: '#fc0'
    },
    {
        name: 'pink',
        value: '#cb53fc'
    }
]

var icons = [
    {
        name: 'build',
        value: 'icon-buildings-1'
    },
    {
        name: 'briefcase',
        value: 'icon-briefcase'
    },
    {
        name: 'connection',
        value: 'icon-connection-1'
    },
    {
        name: 'contact',
        value: 'icon-address-1'
    }
]
var defaultIcon = 'icon-question-mark';

/*** wraper for ko.applyBindings
*    vm -> viewModel(obj) to bind
*    viewName -> string that identifies the DOM that holds view (must exist an element with name="viewName")
*    collectionHandler(optional) -> Meteor collection handler extended with our wait function. The binding will apply when the collection is ready
        todo: support multiple collections
***/
var errorElement = function (msg) {
    return '<div class="alert-danger">' + msg + '</div>';
}
helper = {};
var handleError = function (err, viewName) {
    if (err.originElement) {
        $(err.originElement).replaceWith(errorElement(err.message));
        return true;
    }
    if (!document.getElementsByName(viewName)[0]) {
        console.log(viewName + ' does not exist');
        return;
    }
    console.dir(err);
}
_.extend(helper, {
    applyBindings: function (vm, viewName, collectionHandler) {

        var executeBinding = function () {
            var vmAux = typeof (vm) == "function" ? new vm() : vm;
            try {
                ko.applyBindings(vmAux, document.getElementsByName(viewName)[0]);
            } catch (err) {
                handleError(err, viewName);
            }
        }

        //		var observablesCount = ko.observable(0).subscribe(function (value) {
        //			if (value == 0)
        //				executeBinding();
        //		});

        //		if (typeof collectionHandlers == typeof {})
        //			collectionHandlers = [collectionHandlers];
        //
        //		_.forEach(collectionHandlers, function (collectionHandler) {
        //			if (collectionHandler && collectionHandler.wait) {
        //				observablesCount(observablesCount() + 1);
        //				collectionHandler.wait(function () {
        //					observablesCount(observablesCount() - 1);
        //				});
        //			}
        //		})

        if (!collectionHandler || !collectionHandler.wait) {
            executeBinding();
        } else {
            collectionHandler.wait(executeBinding);
        }
    },
    fieldVM: function (field) {
        switch (field.fieldType) {
        case 0:
            return 'inStringField';
        case 2:
            return 'inDateField';
        case 5:
            return 'inLookUpField';
        }
    },
    relationVM: function (rel) {
        if (rel.cardinality.max == 1)
            return 'inSingle';

        if (rel.cardinality.max == Infinity)
            return 'inMultiple'
    },
    /*  Generate the functions and elements necessary
        for perform full text search and filter * over a list with entities which have dynamic obj types.*Params: * -fieldsToSearch: names of the entity fields where the search will be performed.*-objTypes: list         of types that are used by entities in collection.*-callback: function called after each search * Return: * -searchString: observable item used to search * -filter: ..
    */
    createObjTypefilter: function (fieldsToSearch, objtypes, callback) {
        var self = {};

        var search = function () {
            var q = {};
            var search;
            var filter;
            if (self.searchString()) {
                q.$and = [];
                q.$and.push({
                    $or: []
                });
                search = q.$and[0].$or;

                q.$and.push({
                    $or: []
                });
                filter = q.$and[1].$or;

                _.each(fieldsToSearch, function (prop) {
                    var aux = {};
                    aux[prop + ''] = {
                        $regex: self.searchString()
                    };
                    search.push(aux);
                });
            } else {
                q = {
                    $or: []
                };
                filter = q.$or;
            }

            _.each(self.filter(), function (elem) {
                if (elem.check()) {
                    var aux = {}
                    aux[elem.label] = {
                        $exists: true
                    };
                    filter.push(aux);
                }
            })

            if (filter.length == 0) {
                if (search)
                    q = {
                        $or: search
                    };
                else
                    q = {};
            }

            callback.call({
                query: q
            });
        };

        self.filter = ko.observableArray(
            _.map(objtypes, function (type) {
                var filter = {
                    check: ko.observable(true),
                    label: type.objName,
                    typeId: type._id,
                    glyphicon: type.glyphicon
                };
                filter.check.subscribe(search);
                return filter;
            })

        );
        self.searchString = ko.observable('');
        self.searchString.subscribe(search);

        return self;
    },
    getObjType: function (id) {
        return ObjTypes.findOne({
            _id: id
        });
    },
    getPersonTypes: function () {
        var persontypes = [];
        _.each(Enums.personType, function (err, v) {
            persontypes.push(v);
        });
        return persontypes;
    },
    getJobTypes: function () {
        return ObjTypes.find({
            objGroupType: Enums.objGroupType.job
        }).fetch();
    },
    getIconForObjName: function (objname) {
        var objtype = ObjTypes.findOne({
            objName: objname
        });
        if (objtype && objtype.style && objtype.style.icon)
            return _.findWhere(icons, {
                name: objtype.style.icon
            }).value;

        return defaultIcon;
    },
    getIconForObjType: function (objtype) {
        if (objtype.glyphicon == '') return defaultIcon;
        return objtype.glyphicon;
    },

    getEntityColor: function (entity) {
        var type = ObjTypes.findOne({
            objName: entity.objNameArray[0]
        });
        return _.findWhere(colors, {
            name: type.style.color
        }).value;
    },
    getEntityIcon: function (entity) {
        var type = ObjTypes.findOne({
            objName: entity.objNameArray[0]
        });
        return _.findWhere(icons, {
            name: type.style.icon
        }).value;
    },
    getActivityColor: function (activity) {
        var style = ObjTypes.findOne({
            objName: activity.data.objTypeName()
        }).style;
        return _.findWhere(colors, {
            name: style.color
        }).value;
    },
    getActivityIcon: function (activity) {
        var style = ObjTypes.findOne({
            objName: activity.data.objTypeName()
        }).style;
        return _.findWhere(icons, {
            name: style.icon
        }).value;
    },
    getUserInformation: function (userId) {
        var info = ko.observable({
            ready: ko.observable(false)
        });

        Meteor.call('getUserInformation', userId, function (err, result) {
            _.extend(info(), ko.mapping.fromJS(result));
            info().ready(true);
        });

        return info;
    }
});

_.extend(helper, {
    showModal: function (templateName, view, parameter, callname) {
        var body = $('body');
        var host = body.find(".modal-host")[0];
        if (!host) {
            host = $('<div class="modal-host"> </div>').appendTo(body);
        } else {
            host = $(host);
        }
        _.each(host.children(), function (m) {
            m = $(m);
            ko.cleanNode(m);
            m.modal('toggle');
            m.remove();
            $('.modal-backdrop').remove();
        })
        var template = Template[templateName];
        var modal = $(template()).appendTo(host);

        modal.modal('show');
        if (Template[templateName].viewmodel) {
            helper.applyBindings(new Template[templateName].viewmodel(parameter, callname), view);
        };

        modal.on('hidden.bs.modal', function (e) {
            ko.cleanNode(this);
            modal.remove();
        });
    },

    /* 
     * Return an object with all component necessary to add a dynamic entity (like Contactable or Job).
     * This object is used to extend a viewmodel
     */
    addExtend: function (options) {
        var self = options.self;

        var objType = ObjTypes.findOne({
            objName: options.objname
        });

        var aux = {
            objNameArray: ko.observableArray([objType.objName])
        };
        aux[objType.objName] = ko.observableArray(objType.fields)

        self.entity = ko.validatedObservable(aux);
        self.objTypeName = ko.observable(objType.objName);
        self.ready = ko.observable(false);

        // Apply extend entity
        _.extend(self, options.extendEntity(self));

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

        self.add = function () {
            if (!self.entity().isValid()) {
                self.entity.errors.showAllMessages();
                return;
            };
            var relNames = _.map(self.relations(), function (r) {
                return r.relation.name;
            });
            var relValues = _.map(self.relations(), function (r) {
                if (r.value()) return r.value()._id();
            });
            _.extend(self.entity(), _.object(relNames, relValues));

            var fields = self.entity()[self.objTypeName()]();
            delete self.entity()[self.objTypeName()];
            self.entity()[self.objTypeName()] = {};
            _.forEach(fields, function (field) {
                self.entity()[self.objTypeName()][field.name] = field.value() || field.defaultValue;
            })

            options.addCallback.call(this, self.entity);
        }
    }
})

// New ko validation rules
ko.validation.rules['areSame'] = {
    getValue: function (o) {
        return (typeof o === 'function' ? o() : o);
    },
    validator: function (val, otherField) {
        return val === this.getValue(otherField);
    },
    message: 'The fields must have the same value'
};

ko.validation.rules['uniqueUserInformation'] = {
    async: true,
    validator: function (value, options, callback) {
        var query = {};
        query[options.field] = value;
        Meteor.call('checkUniqueness', query, function (err, result) {
            callback(!err && result);
        });
    },
    message: '{0} is already in use',
};

// Register new rules
ko.validation.registerExtenders();