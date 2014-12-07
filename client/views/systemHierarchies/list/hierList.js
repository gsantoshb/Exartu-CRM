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

console.log('1');

Template.systemHierarchyList.filters = function(){
  return query;
};
Template.systemHierarchyList.created=function() {
  console.log('1a');
  Meteor.call('getSystemHierarchies', {}, function (err, result) {
    console.log('2');
    if (!err){
      console.log('3');
      allhiers=result.sort();
      hiers=result.sort();
      queryDep.changed();
    }else{
      console.log('4');
      console.log('error on getSystemHierarchies:' + err)
    }
  });
}
console.log('5');
Template.systemHierarchyList.systemHierarchies = function () {
  getSystemHierarchies();
  console.log('6');
  queryDep.depend();
  return hiers.sort();
}
Template.systemHierarchyList.helpers({

});



