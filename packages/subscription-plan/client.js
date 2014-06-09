Meteor.subscribe('subscriptionPlans');

SubscriptionPlan.getPercentageStorageUsed = function() {
  var plan = SubscriptionPlan.getUserPlan();
  if (!plan.storageLimit)
    return 0;

  return SubscriptionPlan.storageUsed() * 100 / plan.storageLimit;
};

// Routes access control
(function() {
  _.extend(Router, {
    _route: Router.route,
    route: function(name, options) {
      if (options.plans) {
        options.waitOn = _.wrap(options.waitOn, function(fn) {
          return fn? _.union( fn() || [], [HierarchiesHandler]) : [HierarchiesHandler];
        });
        options.action = _.wrap(options.action, function(fn){
          if (!this.ready()) {
            this.render('loadingContactable');
            return;
          }
          fn && fn.call();
        });
        options.onBeforeAction = _.wrap(options.onBeforeAction, function(fn) {
          if (!this.ready()) {
            return;
          }
          if (!SubscriptionPlan.isAllowed(options.plans)) {
            return Router.go('planLimitation');
          }
          fn && fn.call();
        });
      }
      Router._route(name, options);
    }
  });
})();

UI.registerHelper('subscriptionPlan', function() {
  if (SubscriptionPlan.isAllowed(this.plans))
    this.allow = true;

  if (this.hide)
    return null;

  Template.disabledFeature.message = function() {
    return this.message || 'Feature not supported by your current plan';
  };

  return Template.disabledFeature;
});

Template.disabledFeature.events = {
  'click .disabled-feature': function(e) {
    e.preventDefault();
    e.stopPropagation();
  }
};