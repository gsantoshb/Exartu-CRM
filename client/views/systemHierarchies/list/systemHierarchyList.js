SystemHierarchyListController = RouteController.extend({
  template: 'systemHierarchyList',
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

var getSystemHierarchies= function() {
  var queryObj = query.getObject();
  hiers=allhiers.filter(function(value) {
    return value.name.indexOf(queryObj.searchString) > -1;
  });
  queryDep.changed();
}
var hierSort= function(value1, value2)
{
  if (value1.name<value2.name) return -1;
  return 1;
}

Template.systemHierarchyList.filters = function(){
  return query;
};
Template.systemHierarchyList.created=function() {
  Meteor.call('getSystemHierarchies', {}, function (err, result) {
    if (!err){
      allhiers=result;
      hiers=result;
      queryDep.changed();
    }else{
      console.log('error on getSystemHierarchies:' + err)
    }
  });
}
Template.systemHierarchyList.systemHierarchies = function () {
  getSystemHierarchies();
  queryDep.depend();
  return hiers.sort(hierSort);
}
Template.systemHierarchyList.helpers({

});



