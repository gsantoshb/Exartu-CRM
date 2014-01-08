Meteor.publish('contactables', function() {
	var user = Meteor.users.findOne({_id: this.userId});
	
	if (!user)
		return false;
	
	return Contactables.find({ hierId: user.hierId });
})