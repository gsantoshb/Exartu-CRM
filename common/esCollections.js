// Contactables
ES.syncCollection({
	collection: Contactables,
	fields: [
		{ name: 'person.firstName', label: 'First name'}, { name: 'person.lastName', label: 'Last name'}, { name: 'person.middleName', label: 'Middle name'}, { name: 'person.jobTitle', label: 'Job title'},
		{ name: 'organization.organizationName', label: 'Organization name'},
		{ name: 'Customer.department', label: 'Deparment'},
		{ name: 'Contact.statusNote', label: 'Status note'},
		{ name: 'Employee.statusNote', label: 'Status note'},
		{ name: 'Employee.status', label: 'status'},
		{ name: 'tags', label: 'tags'}, { name: 'contactMethods.value', label: 'Contact method'}, { name: 'location.displayName', label: 'Location'}, { name: 'notes.value', label: 'Notes'}
	],
	// Retrive data related to items on this collections
	// If idFiled is defined then its a "inverse relation"
	relations: [{
			idField: 'links.id',
			fieldName: 'notes',
			valuePath: 'msg',
			collection:	Notes
		}
	]
});