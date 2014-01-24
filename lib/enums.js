Enums = {};
_.extend(Enums, {
	fieldType: {
		string: 0,
		int: 1,
		date: 2,
		select: 3,
		checkbox: 4
	},
	activitiesType: {
		contactableAdd: 0,
		messageAdd: 1
	},
	fieldType: {
		string: 0,
		int: 1,
		date: 2,
		select: 3,
		checkbox: 4
	},
	objectGroups: {
		contactable: 0,
		job: 1,
	}
});

Global = {};
fieldType = Enums.fieldType;
var person = {
	fields: [{
			name: 'firstName',
			regex: /.*/,
			type: fieldType.string,
			defaultValue: '',
			required: true
 }, {
			name: 'lastName',
			regex: /.*/,
			type: fieldType.string,
			defaultValue: '',
			required: true
 }, {
			name: 'middleName',
			regex: /.+/,
			type: fieldType.string,
			defaultValue: ''
 }, {
			name: 'jobTitle',
			regex: /.+/,
			type: fieldType.string,
			defaultValue: ''
 }, {
			name: 'salutation',
			regex: /.+/,
			type: fieldType.string,
			defaultValue: ''
 },
            ],
};
var organization = {
	fields: [{
		name: 'organizationName',
		regex: /.*/,
		type: fieldType.string,
		defaultValue: '',
		required: true
 }]
}
_.extend(Global, {
	person: function () {
		var p = {};
		var names = _.map(person.fields, function (item) {
			return item.name;
		});
		var values = _.map(person.fields, function (item) {
			return item.defaultValue;
		})
		return _.object(names, values);
	},
	personFields: person.fields,

	organization: function () {
		var p = {};
		var names = _.map(person.fields, function (item) {
			return item.name;
		});
		var values = _.map(person.fields, function (item) {
			return item.defaultValue;
		})
		return _.object(names, values);
	},
	organizationFields: organization.fields,
	organization: {
		organizationName: ''
	}
});