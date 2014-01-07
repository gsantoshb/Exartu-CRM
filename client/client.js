Items = new Meteor.Collection("items");

var listsHandle = Meteor.subscribe('items', function () {
    var list = Items.findOne({}, {sort: {name: 1}});
});

Template.items.items = function () {
  return Items.find({}, {sort: {name: 1}});
};

Meteor.loginAsAdmin = function(password, callback) {
  //create a login request with admin: true, so our loginHandler can handle this request
  var loginRequest = {admin: true, password: password};

  //send the login request
  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};