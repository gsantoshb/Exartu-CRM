
EmailTemplateListController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'emailTemplateList'
});

var query = {};
var queryDep = new Deps.Dependency;

Meteor.autorun(function () {
  queryDep.depend();
  Meteor.subscribe('emailTemplates', query);
});

Template.emailTemplateList.helpers({
  templates: function () {
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
    if (query.category == this.id) {
      delete query.category;
    } else {
      query.category = this.id;
    }
    queryDep.changed();
  },
  'keyup #search-template-field': function (event) {
    var searchString = event.currentTarget.value;
    query.name = {
      $regex: "(.)*" + searchString + "(.)*"
    };
    queryDep.changed();
  }
});
