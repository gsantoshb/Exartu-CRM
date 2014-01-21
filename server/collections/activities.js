/* 
 * Activities:
 *  - userId
 *  - hierId
 *  - type
 *  - entityId
 *  - data
 */

Meteor.publish('activities', function () {
	var user = Meteor.users.findOne({
		_id: this.userId
	});

	if (!user)
		return false;

	return Activities.find({
		hierId: user.hierId
	});
})

Contactables.after.insert(function (userId, doc) {
	Activities.insert({
		userId: userId,
		hierId: Meteor.user().hierId,
		type: Enums.activitiesType.contactableAdd,
		entityId: doc._id,
		data: {
			createdAt: doc.createdAt,
		}
	})
})

Messages.after.insert(function (userId, doc) {
	_.forEach(doc.entityIds, function (entity) {
		Activities.insert({
			userId: userId,
			hierId: Meteor.user().hierId,
			type: Enums.activitiesType.messageAdd,
			entityId: entity,
			data: {
				message: doc.message,
				createdAt: doc.createdAt,
			}
		})
	})
})