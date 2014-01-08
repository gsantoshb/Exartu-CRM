Meteor.publish('contactables', function() {
	return Contactables.find();
})