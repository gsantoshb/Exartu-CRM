SimpleSchema.messages({
  'notUnique': '[label] is already in use by another account',
  'passwordMismatch': 'Confirm password must match password'
});

RegisterSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    }
  },
  //username:  {
  //  type: String,
  //  regEx: /^[a-z0-9A-Z_]{3,15}$/,
  //  unique: true,
  //  custom: function() {
  //    if (Meteor.isClient && this.isSet) {
  //      Meteor.call('isUsernameAvailable', this.value, function (error, result) {
  //        if (!result) {
  //          AutoForm.getValidationContext('registerForm').addInvalidKeys([{name: 'username', type: 'notUnique'}]);
  //        }
  //      });
  //    }
  //  }
  //},
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    //unique: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        Meteor.call('isEmailAvailable', this.value, function (error, result) {
          if (!result) {
            AutoForm.getValidationContext('registerForm').addInvalidKeys([
              {name: 'email', type: 'notUnique'}
            ]);
          }
        });
      }
    }
  },
  password: {
    type: String,
    min: 3
  },
  confirmPassword: {
    type: String,
    min: 3,
    custom: function () {
      if (this.value !== this.field('password').value) {
        return 'passwordMismatch';
      }
    }
  }
});

RegisterFromInvitationSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    }
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    //unique: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        Meteor.call('isEmailAvailable', this.value, function (error, result) {
          if (!result) {
            AutoForm.getValidationContext('registerFromInvitation').addInvalidKeys([
              {name: 'email', type: 'notUnique'}
            ]);
          }
        });
      }
    }
  },
  password: {
    type: String,
    min: 3
  },
  confirmPassword: {
    type: String,
    min: 3,
    custom: function () {
      if (this.value !== this.field('password').value) {
        return 'passwordMismatch';
      }
    }
  }
});

AddUserSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});
//
//AddressSchema = new SimpleSchema({
//  linkId: {
//    type: String,
//    optional: true
//  },
//  address: {
//    type: String
//  },
//  address2: {
//    type: String,
//    optional: true
//  },
//  city: {
//    type: String
//  },
//  state: {
//    type: String
//  },
//  country: {
//    type: String
//  },
//  postalCode: {
//    type: String
//  },
//  lat: {
//    type: String,
//    optional: true
//  },
//  lng: {
//    type: String,
//    optional: true
//  },
//  addressTypeId: {
//    type: String
//  }
//
//});