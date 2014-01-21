EmployeeType = {
	_id: 0,
	contactableType: true,
	name: 'Employee',
	services: ['messages', 'tasks'],
	fields: [{
		name: 'test',
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