// TODO: Make ObjectTypes a Meteor collection 
ObjectTypes = [
 	EmployeeType,
	CustomerType,
    CustomerContactType,
	JobType
];

/*
 * Validate if an object has the structure required by the objectType.
 * Return true if:
 *  - objTypeId is valid
 *  - obj has an object with name equal to objType.name
 *  - obj[objType.name] has every field defined in objType.fields
 *  - obj has an object for every service defined in objType.services
 * Params:
 *	- obj: entity that is validated (e.g.: contactable).
 *  - objTypeId: Id of type used to validated the object (obj)
 */

validateObjType = function (obj, objTypeId) {
	var objType = _.findWhere(ObjectTypes, {
		_id: objTypeId
	});

	if (!objType) {
		console.error('Object type does not exists');
		return false;
	}

	if (obj.type.indexOf(objTypeId) < 0) {
		console.error('Objtype incorrect');
		return false;
	}

	// Validating services
	var v = true;
	_.every(Services, function (service) {
		var needed = objType.services.indexOf(service) >= 0;
		var used = obj[service] ? true : false;

		//		if (!((needed && used) || (!needed && !used)))
		//			console.log(service + '-->  needed: ' + needed + '  used: ' + used);
		v = ((needed && used) || (!needed && !used));
		return v;
	});
	if (!v) return false;

	// Validating fields
	var typeInfo = obj[objType.name];
	v = true;
	_.every(objType.fields, function (field) {
		if (typeInfo[field.name]) {
			//			if (!typeInfo[field.name].match(field.regex))
			//				console.log(field.name + '-->  value: ' + typeInfo[field.name]);
			v = v && (typeInfo[field.name].match(field.regex));
			return v;
		} else
			return false;
	});
	if (!v) return false;

	return true;
}

/*
 * Services avialable in the system
 */
Services = ['messages', 'documents', 'pastJobs', 'tags', 'education', 'task'];

Meteor.startup(function () {
	Meteor.methods({
		getObjType: function (id) {
			return _.findWhere(ObjectTypes, {
				_id: id
			});
		},
		getContactableTypes: function () {
			var types = [];
			_.forEach(ObjectTypes, function (type) {
				if (type.contactableType)
					types.push({
						name: type.name,
						_id: type._id
					});
			})
			return types;
		},
		getJobTypes: function () {
			var types = [];
			_.forEach(ObjectTypes, function (type) {
				if (type.jobType)
					types.push({
						name: type.name,
						_id: type._id
					});
			})
			return types;
		}
	});
});