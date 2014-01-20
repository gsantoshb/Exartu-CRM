fieldType = {
	string: 0,
	int: 1,
	date: 2,
	select: 3,
	checkbox: 4
};

CustomerType = {
	_id: 1,
	name: 'Customer',
	services: ['messages', 'tasks'],
	fields: [{
		name: 'test',
		regex: /./,
		type: fieldType.string,
		defaultValue: ''
	}, {
		name: 'test2',
		regex: /./,
		type: fieldType.string,
		defaultValue: ''
	}]
}