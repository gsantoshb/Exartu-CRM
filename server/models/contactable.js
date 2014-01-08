Contactables = new Meteor.Collection("contactables");

Contactables.allow({
	insert: function() {
		return true;
	},
});