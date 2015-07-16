schemaEditContactableWorkInterest = new SimpleSchema({
  'hasTransportation':{
    type:String,
    optional:true
  },
  'desiredPay':{
    type:Number,
    optional:true
  },
  'dateAvailable':{
    type:Date,
    optional:true
  },
  availableStartDate: {
    type: [String],
    allowedValues: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday'],
    optional:true
  },
  availableShifts:{
    type:[String],
    allowedValues: ['1st shift','2nd shift','3rd shift'],
    optional:true
  },
  preferredWorkLocation: {
    type: AddressSchema,
    optional: true
  }
});