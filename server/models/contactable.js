Contactables = new Meteor.Collection("contactables");

Contactables.allow({
	insert: function() {
		return true;
	},
});

Meteor.methods({
	addContactable: function (contactable) {
	  console.log("Stub function works");
	  contactable.test = "test stub";
	  Contactables.insert(contactable);
	}
});