schemaAddEmployee = new SimpleSchema({
  'personFirstName': {
    type: String,
    optional: false
  },
  'personMiddleName': {
    type: String,
    optional: true
  },
  'personLastName': {
    type: String,
    optional: false
  },
  'personJobTitle': {
    type: String,
    optional: true
  },
  'taxId':{
    type:String,
    optional:true
  },
  'statusNote':{
    type:String,
    optional:true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    regEx:/^[\+]?[\s\(\)\-\d]+[\s]*$/,
    optional: true
  },
  phoneType:{
    type: String,
    optional: true,
    custom: function() {
      if ($('#phone').val() && (this.value === undefined)) {
        return "required"
      }

    }
  },
  emailType:{
    type: String,
    optional:true,
    custom: function() {
      if ( $('#email').val() && (this.value === undefined)) {
        return "required"
      }

    }
  }
});