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
	var data = {};
	data.createdAt = doc.createdAt;
	data.objTypeName = doc.objNameArray[0];

	if (doc.person) {
		data.displayName = doc.person.lastName + ', ' + doc.person.firstName + ' ' + doc.person.middleName;
		data.person = {
			jobTitle: doc.person.jobTitle
		}
	} else {
		data.displayName = doc.displayName = doc.organization.organizationName;
	}

	Activities.insert({
		userId: userId,
		hierId: Meteor.user().hierId,
		type: Enums.activitiesType.contactableAdd,
		entityId: doc._id,
		data: data,
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
				createdAt: doc.createdAt
			}
		})
	})
})