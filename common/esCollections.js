// Contactables
// ES.syncCollection({
// 	collection: Contactables,
// 	fields: ['person.firstName', 'person.lastName']
// });

// Jobs
ES.syncCollection({
	collection: Jobs,
	fields: [
		{ name: 'publicJobTitle', sugguster: true },
		'tags'
	]
});

ES.syncCollection({
	collection: Notes,
	fields: [
		{ name: 'content', sugguster: true },
	]
});