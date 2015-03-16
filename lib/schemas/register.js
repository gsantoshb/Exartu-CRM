
RegisterSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    autoValue: function () {
      return new Date;
    }
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
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
