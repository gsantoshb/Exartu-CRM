var dbSeed = {
	/*
	 * Add to system hierarchy the basic object types
	 * 	Contactable:
	 *    - Customer
	 *    - Employee
	 *    - Contact
	 *  Job:
	 *    - Permanent
	 *    - Temporal
	 */
	seedSystemObjTypes: function () {
		var systemObjTypes = [
			{
				type: Enums.objectTypeTypes.contactable,
				name: 'Customer',
				services: ['messages', 'tasks'],
				fields: [{
					name: 'department',
					regex: '.',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true,
				}, {
					name: 'test2',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: false,
				}],
			},
			{
				type: Enums.objectTypeTypes.contactable,
				name: 'CustomerContact',
				services: ['messages', 'tasks'],
				fields: [{
					name: 'test',
					regex: '^(([1-9][0-9]*|[0-9])(.[0-9]*|))$',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
				}, {
					name: 'test2',
					regex: '^[a-z0-9].$',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
				}],
			},
			{
				type: Enums.objectTypeTypes.contactable,
				name: 'Employee',
				services: ['messages', 'tasks'],
				fields: [{
					name: 'test',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
				}, {
					name: 'test2',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
 				}]
			},
			{
				type: Enums.objectTypeTypes.job,
				name: 'Permanent',
				services: ['messages', 'tasks'],
				fields: [{
					name: 'test',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
				}, {
					name: 'test2',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
 				}]
			},
			{
				type: Enums.objectTypeTypes.job,
				name: 'Temporal',
				services: ['messages', 'tasks'],
				fields: [{
					name: 'Type',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
				}, {
					name: 'test2',
					regex: '.*',
					type: Enums.fieldType.string,
					defaultValue: '',
					showInAdd: true
 				}]
			}
		];

		_.forEach(systemObjTypes, function (objType) {
			var type = ObjectTypes.findOne({
				name: objType.name
			});
			if (type == null) {
				ObjectTypes.insert({
					hierId: ExartuConfig.SystemHierarchyId,
					type: objType.type,
					name: objType.name,
					services: objType.services,
					fields: objType.fields,
				})
			} else {
				ObjectTypes.update({
					_id: type._id
				}, {
					$set: {
						services: objType.services,
						fields: objType.fields,
					}
				})
			}
		});
	},
}

Meteor.startup(function () {
	/*
	 * Seed database
	 * Execute all function defined in seedSystemObjTypes
	 */
	_.forEach(dbSeed, function (seedFn) {
		seedFn.call();
	})
});