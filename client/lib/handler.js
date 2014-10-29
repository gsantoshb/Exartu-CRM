SubscriptionHandlers = {};
var LastSubs ={};
var lastName = null;

Meteor.autorun(function () {
  // add current route dependency
  // when it changes, stops all previous handlers
  var route = Router.current();

  if (!route) return;

  var name = route.route.name;

  if (name != lastName){
    lastName = name;
    _.each(LastSubs, function (handler, key) {
      handler.stop();
      //console.log(key + ' stopped');
      delete SubscriptionHandlers[key];
    });
    LastSubs = _.clone(SubscriptionHandlers);
  }
})