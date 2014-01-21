CustomerType = {
	_id: 1,
	name: 'Customer',
	services: ['messages', 'tasks'],
	fields: [{
		name: 'department',
		regex: /./,
		type: Enums.fieldType.string,
		defaultValue: ''
	}, {
		name: 'test2',
		regex: /./,
		type: Enums.fieldType.string,
		defaultValue: ''
	}]
}