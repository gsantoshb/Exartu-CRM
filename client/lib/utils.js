Utils = {};

_.extend(Utils, {
  getUserInformation: function(userId) {
    var user = Meteor.users.findOne({_id: userId});
    if(!user)return null

    user.picture=UsersFS.getThumbnailUrlForBlaze(user.profilePictureId);

    return {
      username: user.username,
      picture: user.picture || '/assets/user-photo-placeholder.jpg'
    };
  }
});

// Prop template
Utils.reactiveProp=function(object, key, value){
  var depName='_dep'+key;
  var valueName='_'+key;
  object[depName]= new Deps.Dependency;
  object[valueName]= value;

  Object.defineProperty(object, key,{
    get:function(){
      this[depName].depend();
      return this[valueName];
    },
    set:function(newValue){
      this[valueName]=newValue;
      this[depName].changed();
    }
  })
}
Utils.ReactivePropertyTypes = {
  string: 0,
  int: 1,
  array: 2,
  date: 3,
  boolean: 5,
  lookUp: 4
};

Utils.ObjectDefinition = function(definition) {
  var self = {};

  // Reactives properties
  _.forEach(_.keys(definition.reactiveProps), function(propName) {
    self[propName] = {};

    var prop = self[propName];
    prop.reactive = true;
    prop.dep = new Deps.Dependency;
    prop.cb = definition.reactiveProps[propName].cb;

    switch(definition.reactiveProps[propName].type) {
      case Utils.ReactivePropertyTypes.array:
        prop.type = Utils.ReactivePropertyTypes.array;
        prop.default  = _.clone(definition.reactiveProps[propName].default) || [];
        Object.defineProperty(prop, "value", {
          get: function () {
            this.dep.depend();
            return this.val;
          },
          set: function (newValue) {
            this.val = newValue;
            this.dep.changed();
            this.error.hasError = !prop.validator();
          }
        });
        prop.insert = function(newValue) {
          this.val.push(newValue);
          this.dep.changed();
          if (this.cb && this.cb.onInsert)
            this.cb.onInsert(newValue);
        };
        prop.remove = function(element) {
          this.val = _.without(this.value, _.findWhere(this.value, element));
          this.dep.changed();
          if (this.cb && this.cb.onRemove)
            this.cb.onRemove(element);
        };

        break;
      default:
        prop.type = definition.reactiveProps[propName].type || Utils.ReactivePropertyTypes.string;
        prop.val = definition.reactiveProps[propName].default || '';
        prop.default  = definition.reactiveProps[propName].default || '';
        Object.defineProperty(prop, "value", {
          get: function () {
            this.dep.depend();
            return this.val;
          },
          set: function (newValue) {
            this.val = newValue;
            this.dep.changed();
            this.error.hasError = !prop.validator();
          }
        });
        break;
    };

    prop.error = {};
    prop.error.dep = new Deps.Dependency;
    prop.error.error = false;
    prop.error.message = definition.reactiveProps[propName].errorMessage || 'Incorrect value';
    Object.defineProperty(prop.error, "hasError", {
      get: function () {
        this.dep.depend();
        return this.error;
      },
      set: function (newValue) {
        this.error = newValue;
        this.dep.changed();
      }
    });


    if (definition.reactiveProps[propName].validator) {
      prop.validator = function() {
        return definition.reactiveProps[propName].validator.call(this);
      }
    }
    else
      prop.validator = function() { return true; }; // Always validate

    if(definition.reactiveProps[propName].options){
      prop.options=definition.reactiveProps[propName].options
    }
    if(definition.reactiveProps[propName].displayName){
      prop.displayName=definition.reactiveProps[propName].displayName
    }
  });

  // Not reactive properties
  _.forEach(_.keys(definition), function(propName) {
    self[propName] = definition[propName];
    var prop = self[propName];
    if (propName != 'reactiveProps') {
      prop.validator = function() { return true; }; // Always validate
    };
  });

  self.getObject = function() {
    var obj = {};
    _.forEach(_.keys(self), function(propName) {
      var prop = self[propName];
      if (prop.reactive) {
        obj[propName] =prop.value;
      }
      else
        obj[propName] = prop;
    });

    return obj;
  };

  self.isValid = function() {
    return _.every(_.keys(definition.reactiveProps), function(propName) {
      return self[propName].validator? self[propName].validator() : true;
    });
  };

  self.showErrors = function() {
    _.forEach(_.keys(self.reactiveProps), function(propName) {
        self[propName].error.hasError = !(self[propName].validator? self[propName].validator() : true);
      }
    );
  };

  self.reset = function() {
    _.forEach(_.keys(definition.reactiveProps), function(propName) {
        var defaultValue = definition.reactiveProps[propName].default;
        switch(definition.reactiveProps[propName].type) {
          case Utils.ReactivePropertyTypes.string:
            self[propName].value = defaultValue || '';
            break;
          case Utils.ReactivePropertyTypes.int:
            self[propName].value= defaultValue || 0;
            break;
          case Utils.ReactivePropertyTypes.array:
            self[propName].value = defaultValue || [];
            break;
          default:
            self[propName].value = defaultValue || '';
            break;
        };
        self[propName].error.hasError = false;
      }
    );
    _.forEach(_.keys(definition), function(propName) {
      if (propName != 'reactiveProps') {
        self[propName] = undefined;
      };
    });
  };

  self.generateUpdate = function() {
    var update = {
      $set: {}
    };
//    debugger;
    _.forEach(_.keys(definition.reactiveProps), function(propName) {
        var propertyUpdatePath = definition.reactiveProps[propName].update;
        if (self[propName].value != definition.reactiveProps[propName].default && propertyUpdatePath)
          update.$set[propertyUpdatePath] = self[propName].value
    });

    return update;
  };

  self.updateDefaults = function() {
    _.forEach(_.keys(definition.reactiveProps), function(propName) {
      definition.reactiveProps[propName].default = self[propName].value;
    });
  };

  return self;
};

Utils.Validators = {};
Utils.Validators.stringNotEmpty = function() {
  return !_.isEmpty(this.value);
}

Utils.getLocation = function (googleLocation) {
  return {
    displayName: googleLocation.formatted_address,
    lat: googleLocation.geometry.location.lat(),
    lng: googleLocation.geometry.location.lng()
  }
}
