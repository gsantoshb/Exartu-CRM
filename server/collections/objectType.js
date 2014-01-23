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

		v = ((needed && used) || (!needed && !used));
		return v;
	});
	if (!v) {
		console.error('invalid service');
		return false;
	}

	// Validating fields
	var typeInfo = obj[objType.name];
	v = true;
	_.every(objType.fields, function (field) {
		if (typeInfo[field.name] != undefined) {
			v = v && (typeInfo[field.name].match(field.regex) != null);
			if (!v) console.error(field.name + ' is invalid: ' + v);
			return v;
		} else {
			v = false;
			console.error(field.name + ' does not exists');
			return false;
		}
	});
	if (!v) {
		console.error('invalid fields');
		return false;
	}

	return true;
}

/*
 * Services avialable in the system
 */
SystemServices = ['messages ', 'documents ', 'pastJobs ', 'tags ', 'education ', 'task '];

Meteor.startup(function () {
	Meteor.methods({
		createObjectType: function (type, name, services, fields) {
			// validate type
			if (!_.contains(Enums.objectTypeTypes, type)) {
				console.error('create objectType: objType type does not exists')
				return null;
			}

			// validate name
			if (!(typeof name == 'string' || name instanceof String)) {
				console.error('create objectType: objType name is not a string')
				return null;
			}

			// validate services
			var v = true;
			if (Object.prototype.toString.call(services) === '[object Array]')
				_.every(services, function (service) {
					if (!_.contains(SystemServices, service)) {
						v = false;
						console.error('create objectType: service does not exists');
						return false;
					}
					return true;
				});
			else {
				console.error('create objectType: objType services is not an array')
				return null;
			}

			// validate fields
			if (Object.prototype.toString.call(fields) === '[object Array]')
				_.every(fields, function (field) {
					if (!(typeof field.name == 'string' || field.name instanceof String)) {
						console.log('create objectType: field name invalid --> ' + field.name);
						v = false;
						return false;
					}
					if (!(typeof field.showInAdd == 'boolean')) {
						console.log('create objectType: field showInAdd invalid --> ' + field.name);
						v = false;
						return false;
					}
					// TODO: validate regex, type and default value
				});
			else {
				console.error('create objectType: objType fields is not an array')
				return null;
			}

			return ObjectTypes.insert({
				hierId: ExartuConfig.SystemHierarchyId,
				type: type,
				name: name,
				services: services,
				fields: fields,
			})
		},
		getObjType: function (id) {
			return ObjectTypes.findOne({
				_id: id
			});
		},
		getContactableTypes: function () {
			return ObjectTypes.find({
				type: Enums.objectTypeTypes.contactable
			}).fetch();
		},
		getJobTypes: function () {
			return ObjectTypes.find({
				type: Enums.objectTypeTypes.job
			}).fetch();
		}
	});
});