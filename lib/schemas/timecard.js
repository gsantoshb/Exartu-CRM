
TimecardSchema = new SimpleSchema({
  regularHours: {
    type: Number,
    optional: true
  },
  overtimeHours: {
    type: Number,
    optional: true
  },
  doubleTimeHours: {
    type: Number,
    optional: true
  }
});
