CardReaderController = RouteController.extend({
  waitOn: function () {
    //return Meteor.subscribe('hierarchies');
  },
  action: function () {
    if (this.ready())
      this.render('cardReader');
    else
      this.render('loading');
  }
});

var CardReaderConfigurationSchema = new SimpleSchema({
  appId: {
    type: String,
    label: 'App Id'
  },
  password: {
    type: String
  }
});

AutoForm.hooks({
  editCardReaderConf: {
    onSubmit: function (configuration) {
      var self = this;

      loading.set(true);
      // Validate web name
      Meteor.call("setCardReaderConfiguration", configuration, function (err, result) {
        if (err) {
          console.log(err);
          error.set(err.error || err.reason);
        } else {
          error.set('');
        }
        self.done(err);

        loading.set(false);
      });

      return false;
    }
  }
});

var fsFile = undefined,
  error = new ReactiveVar(''),
  loading = new ReactiveVar(false);

Template.cardReader.helpers({
  getSchema: function () {
    return CardReaderConfigurationSchema;
  },
  error: function() {
    return error.get();
  },
  loading: function() {
    return loading.get();
  }
});

Template.cardReader.events({
  'click #edit-pic': function () {
  }
});

