SystemHierarchyListController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
  },
  data: function () {

  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render();
  },
  onAfterAction: function () {

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



Template.systemHierarchyList.filters = function(){
  return query;
};
Template.systemHierarchyList.created=function() {

  Meteor.call('getSystemHierarchies', {}, function (err, result) {
    if (!err){
      allhiers=result.sort();
      hiers=result.sort();
      queryDep.changed();
    }else{
      console.log('error on getSystemHierarchies:' + err)
    }
  });
}
Template.systemHierarchyList.systemHierarchies = function () {
  getSystemHierarchies();
  queryDep.depend();
  return hiers.sort();
}
Template.systemHierarchyList.helpers({

});



