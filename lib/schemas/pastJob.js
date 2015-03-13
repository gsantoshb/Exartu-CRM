
PastJobSchema = new SimpleSchema({
  company: {
    type: String
  },
  position: {
    type: String
  },
  reasonForLeaving: {
    type: String,
    optional: true
  },
  ok2Contact: {
    type: Boolean,
    optional: true,
    defaultValue: true,
    label: 'Can we contact them?'
  },
  payRate: {
    type: Number,
    optional: true
  },
  duties: {
    type: String,
    optional: true
  },
  supervisor: {
    type: String,
    optional: true
  },
  location: {
    type: String
  },
  start: {
    type: Date,
    defaultValue: new Date(),
    label: 'Start date'
  },
  end: {
    type: Date,
    label: 'End date',
    optional: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        if (this.field('start').value > this.value){
          return 'endGreaterThanStart';
        }
      }
    }
  }
});
PastJobSchema.messages({
  endGreaterThanStart: '[label] should be grater than start date'
});
