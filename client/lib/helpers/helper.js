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
    },
    {
        name: 'blue',
        value: '#1c91f5'
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

/*** wrapper for ko.applyBindings
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
    getContactMethodDisplayName: function (type) {
        var typeDisplayName = _.findWhere(Enums.contactMethodTypes, {
            code: type()
        });
        return typeDisplayName ? typeDisplayName.displayName : '';
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
        _.extend(info(), Meteor.users.findOne({
            _id: userId
        }));
        info().picture = helper.getUserPictureUrl(info());
        info().ready(true);

        return info;
    },
    getUserPictureUrl: function (user) {
        //        debugger;
        var user = ko.toJS(user);
        var defaultUserPicture = '/img/avatar.jpg';
        if (!user || !user.profilePictureId) {
            if (user.services && user.services.google)
                return user.services.google.picture
            return defaultUserPicture;
        }
        var picture = UsersFS.findOne({
            _id: user.profilePictureId
        });
        if (!picture || !picture.fileHandler.
            default)
            return defaultUserPicture;

        return picture.fileHandler.
        default.url;
    },
    // Return picture's url, used in job list
    getCustomerPictureUrl: function (customer) {
        return getContactablePictureUrl(customer && customer.pictureFileId ? customer.pictureFileId() : null, '/assets/logo-exartu.png')
    },
    getEmployeePictureUrl: function (employee) {
        return getContactablePictureUrl(employee && employee.pictureFileId ? employee.pictureFileId() : null, '/assets/user-photo-placeholder.jpg')
    },

});
var getContactablePictureUrl = function (pictureFileId, defaultURL) {
    if (!pictureFileId) {
        return defaultURL;
    }
    var picture = ContactablesFS.findOne({
        _id: pictureFileId
    });
    if (!picture || !picture.fileHandler.
        default)
        return defaultURL;

    return picture.fileHandler.
    default.url;
}


_.extend(helper, {
    /* 
     * Return an object with all component necessary to add a dynamic entity (like Contactable or Job).
     * This object is used to extend a viewmodel
     */
    addExtend: function (options) {
        var self = options.self;
//        debugger;
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
                    value: item.multiple ? ko.observableArray().extend({
                        required: true
                    }) : ko.observable().extend({
                        required: true
                    }),
                    options: LookUps.findOne({
                        name: item.lookUpName
                    }).items,
                })
            }
        });

        //relations
        self.relations = ko.observableArray([]);
        Meteor.call('getShowInAddRelations', objType.objName, objType.objGroupType, function (err, result) {
            _.each(result, function (r) {
                self.relations.push({
                    relation: r,
                    data: ko.meteor.find(window[r.target.collection], r.target.query),
                    value: ko.observable()
                });
            })

            self.ready(true);
        });

        self.add = function () {
            if (!self.entity().isValid()) {
                self.entity.errors.showAllMessages();
                return;
            };
            var objRels =[];
            var ObjGroupRelNames =[];

            var ObjGroupRelValues =[];
            debugger;
            _.each(self.relations(), function (r) {
                if(r.relation.isGroupType){
                    ObjGroupRelNames.push(r.relation.name);
                    if (r.value())
                        ObjGroupRelValues.push(r.value()._id());
                }else{
                    objRels.push({
                        name:r.relation.name,
                        value: r.value() ? r.value()._id(): null
                    });
                }
            });

            _.extend(self.entity(), _.object(ObjGroupRelNames, ObjGroupRelValues));


            var fields = self.entity()[self.objTypeName()]();
            delete self.entity()[self.objTypeName()];
            self.entity()[self.objTypeName()] = {};
            _.forEach(fields, function (field) {
                self.entity()[self.objTypeName()][field.name] = field.value() || field.defaultValue;
            })
            _.forEach(objRels, function (rel) {
                self.entity()[self.objTypeName()][rel.name] = rel.value ;
            })
//            _.extend(self.entity()[self.objTypeName()], _.object(relNames, relValues));

            options.addCallback.call(this, self.entity);
        }
    }
})

/*
 * Tasks
 */
var taskStatesStyle = {};

taskStatesStyle['Pending'] = {
    icon: 'fa fa-exclamation-circle',
    textCSS: 'text-danger',
};
taskStatesStyle['Future'] = {
    icon: 'fa fa-forward',
    textCSS: 'text-info',
};
taskStatesStyle['Completed'] = {
    icon: 'fa fa-check-circle',
    textCSS: 'text-success',
};
taskStatesStyle['Closed'] = {
    icon: 'fa fa-archive',
    textCSS: 'text-muted',
};

_.extend(helper, {
    getTaskStateIcon: function (state) {
        var data = taskStatesStyle[state];
        return data ? data.icon : '';
    },
    getTaskStateCSS: function (state) {
        var data = taskStatesStyle[state];
        return data ? data.textCSS : '';
    }

})