Contactables = new Meteor.Collection("contactables");

Meteor.methods({
	addContactable: function (contactable) {
        var user = Meteor.user();
       	if (user == null)
       		throw new Meteor.Error(401, "Please login");
     
     	contactable.userId = user._id;
       	contactable.hierId = user.hierId;
     
   		Contactables.insert(contactable);
	},
});