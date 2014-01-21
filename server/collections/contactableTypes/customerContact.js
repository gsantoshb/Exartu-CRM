CustomerContactType = {
	_id: 3,
	contactableType: true,
	name: 'CustomerContact',
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