UsersHandler = {
  ready: function () {
    if (!Accounts.loginServicesConfigured())
      return false;
    if (Meteor.loggingIn()) {
      return false;
    }
    return true;
  },
  observers: [],
  wait: function (cb) {
    if (UsersHandler.ready()) {
      cb('users');
    } else {
      if (UsersHandler.observers.length == 0) {
        setTimeout(UsersHandler.check, 500);
      }
      UsersHandler.observers.push(cb);
    }
  },
  check: function () {
    if (UsersHandler.ready()) {
      _.each(UsersHandler.observers, function (cb) {
        cb('users');
      })
    } else {
      setTimeout(UsersHandler.check, 500);
    }
  }

}

Roles = new Meteor.Collection("roles");
Meteor.subscribe('roles');