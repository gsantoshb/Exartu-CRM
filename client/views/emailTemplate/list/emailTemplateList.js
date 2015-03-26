var query = { };
var HandlerTemplates;
var queryDep =  new Deps.Dependency;
EmailTemplateListController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'emailTemplateList'
  //waitOn: function () {
  //  return [Meteor.subscribe('emailTemplateMergeFields'), Meteor.subscribe('emailTemplates')];
  //},
  //data: function () {
  //  Session.set('templateId', this.params._id);
  //},
  //action: function () {
  //  if (!this.ready()) {
  //    this.render('loadingContactable');
  //    return;
  //  }
  //  this.render('emailTemplate')
  //},
  //onAfterAction: function () {
  //
  //}
});

Meteor.autorun(function(){
  queryDep.depend();
  if(HandlerTemplates ){
    HandlerTemplates.stop();
  }
  Meteor.subscribe('emailTemplates', query);


})

Template.emailTemplateList.helpers({
  templates: function () {
    queryDep.depend();
    return EmailTemplates.find();
  },
  categories: function () {
    return _.map(Enums.emailTemplatesCategories, function (val, key) {
      return {
        name: key,
        id: val
      }
    })
  },
  isSelectedClass: function () {
    queryDep.depend();
    return this.id == query.category ? 'btn-primary' : 'btn-default';
  }
});

Template.emailTemplateList.events({
  'click .categorySelect': function () {
    queryDep.changed();
    if (query.category == this.id){
      delete query.category;
    }else{
      query.category = this.id;
    }
  },
  'keyup #search-template-field': function(evnt, as, a){
    var searchString = evnt.currentTarget.value;
    query['name'] = {
      $regex: "(.)*"+searchString+"(.)*"
    }
    queryDep.changed();
  }
});