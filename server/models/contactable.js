Contactables = new Meteor.Collection("contactables");

Meteor.methods({
	addContactable: function (contactable) {
	  	var user = Meteor.user();
	  	if (user == null)
			throw new Meteor.Error(401, "Unauthorized. Login before execute this method.");
		
		contactable.userId = user._id;
	  	contactable.hierId = user.hierId;
		
	  	Contactables.insert(contactable);
	},
});