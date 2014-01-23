var CustomerRelation = function () {
	var q = {};
	q[CustomerType.name] = {
		$exists: true
	}
	return q;
}

JobType = {
	_id: 4,
	jobType: true,
	name: 'Basic',
	services: ['messages', 'tasks'],
	fields: [{
		name: 'Job title',
		regex: '.*',
		type: Enums.fieldType.string,
		defaultValue: '',
		showInAdd: true
    }, {
		name: 'Job description',
		regex: '.*',
		type: Enums.fieldType.string,
		defaultValue: '',
		showInAdd: true
    }],
	relations: [{
		name: 'Customer',
		target: {
			collection: 'Contactables',
			query: CustomerRelation()
		},
		cardinality: {
			min: 1,
			max: 1
		},
		defaultValue: null,
		validate: function (v) {
			return (v.type) && (v.type.indexOf[CustomerType._id] >= 0);
		},
		showInAdd: true,
	}]
}