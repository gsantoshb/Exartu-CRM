// Contactables
ES.syncCollection({
	collection: Contactables,
	fields: ['person.firstName', 'person.lastName']
});

// Jobs
ES.syncCollection({
	collection: Jobs,
	fields: ['publicJobTitle', 'tags']
});