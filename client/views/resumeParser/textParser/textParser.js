
var isParsing = false;
var isParsingDep = new Tracker.Dependency;
var error = '';
var errorDep = new Tracker.Dependency;

Template.textParser.helpers({
  // Auto form schema
  parserSchema: function () {
    return new SimpleSchema({
      text: {
        type: String,
        label: "The text to parse"
      }
    });
  },

  // Parsing state
  isParsing: function () {
    isParsingDep.depend();
    return isParsing;
  },

  // Error message
  error: function () {
    errorDep.depend();
    return error;
  }
});

Template.textParser.events({
  // Cancel button
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});


AutoForm.hooks({
  textParserForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      // Set current state
      isParsing = true;
      isParsingDep.changed();
      error = '';
      errorDep.changed();

      // Try to create an employee from the text
      Meteor.call('createEmployeeFromPlainText', insertDoc.text, function (err, result) {
        isParsing = false;
        isParsingDep.changed();

        if (err) {
          // Update the error message variable
          error = err.error;
          errorDep.changed();
        } else {
          // Redirect the user to the new employee page
          Utils.dismissModal();
          Router.go('/contactable/' + result);
        }

        self.done();
      });

      return false;
    }
  }
});

