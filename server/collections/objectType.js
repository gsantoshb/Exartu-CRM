ObjectTypes = [
	{
		_id: 0,
		name: 'Employee',
		sysRes: ['Message'],
		validate: function (obj) {
			if (obj.type.indexOf(this._id) < 0)
				return false;
			if (!obj.messages)
				return false;
			if (obj.person & (!validatePerson(obj.person)))
				return false;
			if (obj.organization & (!validateOrganization(obj.person)))
				return false;
		},
		getFields: function () {
			return [{
				name: 'string',
				regex: /.+/,
				type: Enums.fieldType.string,
				defaultValue: '',
			}, {
				name: 'date',
				regex: /.+/,
				type: Enums.fieldType.date,
				defaultValue: '',
			}]
		}
	},
	{
		_id: 1,
		name: 'Customer',
		sysRes: ['Message'],
		validate: function (obj) {
			if (obj.type.indexOf(this._id) < 0)
				return false;
			if (!obj.messages)
				return false;
			if (obj.person & (!validatePerson(obj.person)))
				return false;
			if (obj.organization & (!validateOrganization(obj.person)))
				return false;
		},
		getFields: function () {
			return [{
				name: 'string_customer',
				regex: /.+/,
				type: Enums.fieldType.string,
				defaultValue: '',
			}, {
				name: 'date_customer',
				regex: /.+/,
				type: Enums.fieldType.date,
				defaultValue: '',
			}]
		},
	},
];

Meteor.startup(function () {
	Meteor.methods({
		getFields: function (id) {
			type = _.findWhere(ObjectTypes, {
				_id: id
			});
			if (type)
				return type.getFields();
		},
		getContactableTypes: function () {
			return _.map(ObjectTypes, function (type) {
				return {
					name: type.name,
					_id: type._id
				}
			});
		}
	});
});