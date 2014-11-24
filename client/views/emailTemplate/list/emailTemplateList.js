EmailTemplateListController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return Meteor.subscribe('emailTemplates');
  },
  data: function () {

  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('emailTemplateList');
  },
  onAfterAction: function () {

  }
});
var query = { };
var queryDep =  new Deps.Dependency;

Template.emailTemplateList.helpers({
  templates: function () {
    queryDep.depend();
    return EmailTemplates.find(query);
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
  }
});