/**
 * Created by ramiro on 25/05/15.
 */
schemaContactMethods = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    regEx:/^[\+]?[\s\(\)\-\d]+[\s]*$/,
    optional: true
  }
});
