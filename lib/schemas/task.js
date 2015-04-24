
TaskSchema = new SimpleSchema({
  msg: {
    type: String
  },
  assign: {
    type: String
  },
  begin: {
    type: Date
  },
  end: {
    type: Date,
    optional: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        if (this.field('begin').value > this.value) {
          return 'endGreaterThanStart';
        }
      }
    }
  },
  completed: {
    type: Date,
    optional: true
  }
});
TaskSchema.messages({
  endGreaterThanStart: '[label] should be grater than begin date'
});
