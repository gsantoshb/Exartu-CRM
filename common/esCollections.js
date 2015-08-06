// Contactables
ES.syncCollection({
	collection: Contactables,
  indexName: 'javierlocal',
  type: 'contactables',
	fields: [
		{ name: 'idField', label: 'Id'},
		{ name: 'hierId', label: 'HierId', mapping: { type: 'string', index: "not_analyzed" } },
		{ name: 'person.firstName', label: 'First name', boost:5},
    { name: 'person.lastName', label: 'Last name', boost:5},
		{ name: 'person.middleName', label: 'Middle name', boost:3},
    { name: 'person.jobTitle', label: 'Job title'},
		{ name: 'organization.organizationName', label: 'Organization name', boost:5},
		{ name: 'Client.department', label: 'Deparment', boost:3},
		{ name: 'statusNote', label: 'Status note'},
		{ name: 'Employee.status', label: 'status'},
		{ name: 'Employee.taxID', label: 'SSN'},
		{ name: 'tags', label: 'tags'},
    { name: 'contactMethods.value', label: 'Contact method'}
	],
	// Retrive data related to items on this collections
	// If idFiled is defined then its a "inverse relation"
	relations: [{
			idField: 'links.id',
			fieldName: 'notes',
			valuePath: 'msg',
			collection:	Notes
		},{
			idField: 'linkId',
			fieldName: 'addresses',
			valuePath: 'address',
			collection:	Addresses
		},{
			idField: 'linkId',
			fieldName: 'city',
			valuePath: 'city',
			collection:	Addresses
		},{
			idField: 'linkId',
			fieldName: 'state',
			valuePath: 'state',
			collection:	Addresses
		},{
			idField: 'linkId',
			fieldName: 'country',
			valuePath: 'country',
			collection:	Addresses
		}
	]
});