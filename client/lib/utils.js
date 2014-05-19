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

Utils.ReactivePropertyTypes = {
  string: 0,
  int: 1,
  array: 2
};

Utils.ObjectDefinition = function(definition) {
  var self = this;

  // Reactives properties
  _.forEach(_.keys(definition.reactiveProps), function(propName) {
    self[propName] = {};

    var prop = self[propName];
    prop.reactive = true;
    prop.dep = new Deps.Dependency;

    switch(definition.reactiveProps[propName].type) {
      case Utils.ReactivePropertyTypes.array:
        prop.type = Utils.ReactivePropertyTypes.array;
        prop.val = definition.reactiveProps[propName].default || [];
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
        };
        prop.remove = function(element) {
          this.val = _.without(this.value, _.findWhere(this.value, element));
          this.dep.changed();
        };

        break;
      default:
        prop.type = definition.reactiveProps[propName].type || Utils.ReactivePropertyTypes.string;
        prop.val = definition.reactiveProps[propName].default || '';
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
  });

  // Not reactive properties
  _.forEach(_.keys(definition), function(propName) {
    self[propName] = {};
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
    return _.every(self, function(prop) {
      return prop.validator? prop.validator() : true;
    });
  };

  self.showErrors = function() {
    _.forEach(self, function(prop) {
        prop.error.hasError = !(prop.validator? prop.validator() : true);
      }
    );
  };

  self.reset = function() {
    _.forEach(_.keys(definition.reactiveProps), function(propName) {
        switch(definition.reactiveProps[propName].type) {
          case Utils.ReactivePropertyTypes.string:
            self[propName].value = '';
            break;
          case Utils.ReactivePropertyTypes.int:
            self[propName].value= 0;
            break;
          case Utils.ReactivePropertyTypes.array:
            self[propName].value = [];
            break;
          default:
            self[propName].value = '';
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

  return self;
};

