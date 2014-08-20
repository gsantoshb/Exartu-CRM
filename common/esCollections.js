// Contactables
ES.syncCollection({
	collection: Contactables,
	fields: [
		'person.firstName', 'person.lastName', 'person.middleName', 'person.jobTitle',
		'organization.organizationName',
		'Customer.department',
		'Contact.statusNote',
		'Employee.statusNote',
		'Employee.recruiterStatus',
		'tags', 'contactMethods.value', 'location.displayName', 'notes.value, resume.value'
	],
	// Retrive data related to items on this collections
	// If idFiled is defined then its a "inverse relation"
	relations: [{
			idField: 'links.id',
			fieldName: 'notes',
			valuePath: 'content',
			collection:	Notes
		}
	]
});