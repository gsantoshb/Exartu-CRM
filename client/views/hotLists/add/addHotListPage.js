
HotListAddController = RouteController.extend({
  onAfterAction: function () {
    var title = 'Add Hot List';
    SEO.set({
      title: title,
      og: { 'title': title }
    });
  }
});

var error = new ReactiveVar(''),
    isSubmitting = new ReactiveVar(false);

// Main template
Template.addHotListPage.helpers({
  categories: function () {
    return _.map(_.values(MergeFieldHelper.categories), function (cat) { return {label: cat.name, value: cat.value} });
  },
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  }
});

Template.addHotListPage.events({
  'click .goBack': function () {
    history.back();
  }
});


AutoForm.hooks({
  addHotListForm: {
    onSubmit: function(insertDoc) {
      var self = this;

      // Clean schema for auto and default values
      HotListSchema.clean(insertDoc);

      // Clear error message
      error.set('');

      // Insert Hot List
      isSubmitting.set(true);
      Meteor.call('addHotList', insertDoc, function (err, result) {
        isSubmitting.set(false);
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          self.done();
          Router.go('/hotList/' + result);
        }
      });

      return false;
    }
  }
});