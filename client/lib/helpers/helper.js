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
helper = {
    emailRE:/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};
helper.emailRE.str="^(([^<>()[\\]\\.,;:\\s@\"]+(\\.[^<>()[\\]\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))";

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
      case 1:
        return 'inIntField';
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
   to perform full text search and filter * over a list of entities which have dynamic obj types.
   *Params: * -fieldsToSearch: names of the entity fields where the search will be performed.
   * *-objTypes: list         of types that are used by entities in collection.*-callback: function called after each search
   * * Return:
   * * -searchString: observable item used to search * -filter: ..
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
        _.each(Enums.personType, function (v) {
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
      ready: ko.observable(false),
      picture: ko.observable()
    });

    _.extend(info(), Meteor.users.findOne({
      _id: userId
    }));
    debugger;
    UsersFS.getThumbnailUrl(info().profilePictureId, info);

    return info;
  },
  getUserPictureUrl: function (user) {
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

  getUserPictureUrlAsync: function (user, cb) {
    var user = ko.toJS(user);
    var defaultUserPicture = '/img/avatar.jpg';
    var counter = 0;
    var chechFileHandler = function (pictureId, cb) {
      var picture = UsersFS.findOne({
        _id: pictureId
      });
      if (!picture)
        return cb(defaultUserPicture);
      if (picture.fileHandler.default)
        return cb(picture.fileHandler.default.url);
      counter++;
      if (counter > 20) {
        return cb(defaultUserPicture);
      }
      setTimeout(function () {
        chechFileHandler(pictureId, cb);
      }, 200 + counter * 200)
    }
    if (!user || !user.profilePictureId) {
      if (user.services && user.services.google)
        return cb(user.services.google.picture);
      return cb(defaultUserPicture);
    }
    chechFileHandler(user.profilePictureId, cb);
  },
  // Return picture's url, used in job list
  getCustomerPictureUrl: function (customerId) {
    var customer = Contactables.findOne({_id: customerId});
    if (!customer)
      return {};

    return ContactablesFS.getThumbnailUrl(customer.pictureFileId);
  },

  getEmployeePictureUrl: function (employee) {
    return getContactablePictureUrl(employee && employee.pictureFileId ? employee.pictureFileId() : null, '/assets/user-photo-placeholder.jpg')
  },
  getContactablePictureUrl: function (contactable) {
    return getContactablePictureUrl(contactable && contactable.pictureFileId ? contactable.pictureFileId() : null, contactable.Customer ? '/assets/logo-exartu.png' : '/assets/user-photo-placeholder.jpg')
  },
  getContactPictureUrl: function (contact) {
    return getContactablePictureUrl(contact && contact.pictureFileId ? contact.pictureFileId() : null, '/assets/user-photo-placeholder.jpg')
  },
  getEmployeePictureAsync: function (employee) {
        return getContactablePictureAsync(ko.toJS(employee), Global.defaultEmployeePicture);
  },
  getContactableFilePictureAsync: function (fileId) {
    var data = ko.observable({
      ready: ko.observable(false),
      picture: ko.observable()
    });
    getPictureAsync(ContactablesFS, fileId, Global.defaultEmployeePicture, function (url) {
      data().picture(url);
      data().ready(true);
    });
    return data;
  },

});
var getContactablePictureAsync = function (contactable, defaultURL) {
  var data = ko.observable({
    ready: ko.observable(false),
    picture: ko.observable()
  });

  if (!contactable.pictureFileId) {
    data().picture(defaultURL);
    data().ready(true);
  } else {
    getPictureAsync(ContactablesFS, contactable.pictureFileId, defaultURL, function (url) {
      data().picture(url);
      data().ready(true);
    })
  }
  return data;
}

// tries to get a picture maxCallStack times (20 is the default)
getPictureAsync = function (colection, id, defaultUrl, cb, maxCallStack) {
    if (!id){
        return cb(defaultUrl);
    }
  if (!maxCallStack) {
    maxCallStack = 20;
  }
  var chechFileHandler = function (callStackSize) {
    if (!callStackSize)
      callStackSize = 0;

    var picture = colection.findOne({
      _id: id
    });
    if (!picture)
      return cb(defaultUrl);
    //debugger;
    var url = picture.url({store: 'contactableFiles'});

    if (url)
      return cb(url);

    return;

//    if (picture.fileHandler.default)
//      return cb(picture.fileHandler.default.url);
//
//    if (callStackSize > maxCallStack) {
//      return cb(defaultUrl);
//    }

    setTimeout(function () {
      chechFileHandler(callStackSize + 1);
    }, 200 + callStackSize * 200)
  }
  chechFileHandler();
};

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
    var objType = ObjTypes.findOne({
      objName: options.objname
    });

    var aux = {
      objNameArray: ko.observableArray([objType.objName])
    };
    aux[objType.objName] = ko.observableArray(objType.fields)
    var entityOptions=options.entityOptions || {};

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
                options: LookUps.find({
                    codeType: item.lookUpCode
                }).fetch()
            })
        }
        if (entityOptions.hasOwnProperty(item.name)){
            item.value(entityOptions[item.name]);
            item.editable=false;
        }else{
            item.editable=true;
        }
    });

    //relations
    self.relations = ko.observableArray([]);
    Meteor.call('getShowInAddRelations', objType.objName, objType.objGroupType, function (err, result) {
        _.each(result, function (r) {
//            debugger;
            self.relations.push({
                relation: r,
                data: ko.meteor.find(window[r.target.collection], r.target.query),
                value: ko.observable(entityOptions.hasOwnProperty(r.name) ? entityOptions[r.name] : undefined),
                editable: ! entityOptions.hasOwnProperty(r.name)
            });
        })
        self.ready(true);
    });

    self.filterSelectedValue = function (data) {
      return ko.isObservable(data._id)? data._id() : data._id;
    }

    self.add = function () {
      if (!self.entity().isValid()) {
        self.entity.errors.showAllMessages();
        return;
      }
      ;
      var objRels = [];
      var ObjGroupRelNames = [];

      var ObjGroupRelValues = [];
      _.each(self.relations(), function (r) {
        if (r.relation.isGroupType) {
          ObjGroupRelNames.push(r.relation.name);
          if (r.value())
            ObjGroupRelValues.push(r.value());
        } else {
          objRels.push({
            name: r.relation.name,
            value: r.value() ? r.value() : undefined
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
        self.entity()[self.objTypeName()][rel.name] = rel.value;
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
_.extend(helper, {
  getCoords: function (address) {
    if (!address) {
      return null;
    }
    return{
      latitud: address.geometry.location.lat(),
      longitud: address.geometry.location.lng()
    }
  }
});
