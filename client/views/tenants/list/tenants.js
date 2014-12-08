TenantsController = RouteController.extend({
  template: 'tenants',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [HierarchiesHandler];
  }
});
var queryDep =  new Deps.Dependency;
var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {}
  }
});
var hiers=[];
var allhiers=[];

var getTenants= function() {
  var queryObj = query.getObject();
  hiers=allhiers.filter(function(value) {
    var val=value.name + ' ' + value.firstUser.emails[0].address;
    return val.indexOf(queryObj.searchString) > -1;
  });
  queryDep.changed();
}
var hierSort= function(value1, value2)
{
  if (value1.name<value2.name) return -1;
  return 1;
}

Template.tenants.filters = function(){
  return query;
};
Template.tenants.created=function() {
  Meteor.call('getTenants', {}, function (err, result) {
    if (!err){
      allhiers=result;
      hiers=result;
      queryDep.changed();
    }else{
      console.log('error on getTenants:' + err)
    }
  });
}

Template.tenants.getFirstUserText = function ()
{
  return this.firstUser.emails[0].address;
};

Template.tenants.tenants = function () {
  getTenants();
  queryDep.depend();
  return hiers.sort(hierSort);
}






