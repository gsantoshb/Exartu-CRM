
AddUserSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  }
});

EditUserInfoSchema = new SimpleSchema({
  firstName: {
    type: String,
    optional: true
  },
  lastName: {
    type: String,
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        Meteor.call("isEmailAvailable", this.value, { ignoreMine: true }, function (error, result) {
          if (!result) {
            EditUserInfoSchema.namedContext("editUserInfo").addInvalidKeys([{name: "email", type: "notUnique"}]);
          }
        });
      }
    }
  }
});

ChangeUserPasswordSchema = new SimpleSchema({
  oldPassword: {
    type: String
  },
  newPassword: {
    type: String,
    min: 3
  },
  confirmPassword: {
    type: String,
    custom: function () {
      if (this.value !== this.field('newPassword').value) {
        return 'passwordMismatch';
      }
    }
  }
});