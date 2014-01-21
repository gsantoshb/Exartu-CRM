JobType = {
	_id: 4,
	jobType: true,
	name: 'Permanent job',
	services: ['messages', 'tasks'],
	fields: [{
		name: 'Salary',
		regex: /./,
		type: Enums.fieldType.int,
		defaultValue: ''
	}, {
		name: 'Hours per week',
		regex: /./,
		type: Enums.fieldType.int,
		defaultValue: ''
	}]
}