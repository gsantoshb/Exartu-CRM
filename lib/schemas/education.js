
EducationSchema = new SimpleSchema({
  institution: {
    type: String
  },
  description: {
    type: String
  },
  degreeAwarded: {
    type: String,
    optional: true
  },
  start: {
    type: Date,
    defaultValue: new Date(),
    label: 'Start Date'
  },
  end: {
    type: Date,
    optional: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        if (this.field('start').value > this.value){
          return 'endGreaterThanStart';
        }
      }
    },
    label: 'End Date'
  }
});
EducationSchema.messages({
  endGreaterThanStart: '[label] should be grater than start date'
});