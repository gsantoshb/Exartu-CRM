/**
 * Created by ramiro on 15/07/15.
 */
AddressSchema =new SimpleSchema({
  address: {
    type: String,
    optional:true
  },
  lat: {
    type: Number,
    decimal: true,
    optional:true
  },
  lng: {
    type: Number,
    decimal: true,
    optional:true
  },
  street: {
    type: String,
    max: 100,
    optional:true
  },
  city: {
    type: String,
    max: 50,
    optional:true
  },
  state: {
    type: String,
    optional:true
  },
  zip: {
    type: String,
    regEx: /^[0-9]{5}$/,
    optional:true
  },
  country: {
    type: String,
    optional:true
  }
});