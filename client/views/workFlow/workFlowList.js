WorkFlowsController = RouteController.extend({
  data: function(){
  },
  waitOn: function () {
  },
  action: function () {
    this.render('workFlowList');
  },
  onAfterAction: function() {
  }
});