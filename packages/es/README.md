# Elasticsearch package
Exartu package used to sync collections in mongo with an Elasticsearch server.

# Installation
Add this repository as a submodule to ../myprojectpath/packages/

And then:
```sh
$ meteor add es
```

# Server side
**Example**
```javascript
ES.syncCollection({
	collection: Contactables,
	fields: [
		{ name: 'person.firstName', label: 'First name'}, 
		{ name: 'person.lastName', label: 'Last name'}
	],
	relations: [{
			idField: 'links.id',
			fieldName: 'notes',
			valuePath: 'msg',
			collection:	Notes
		}
	]
});
```

**ES.syncCollection**  
Used to specify collections that are being synchronized with the Elasticsearch server

  - *Fields:* define which fields are goint to be considered when performing a Elasticsearch query.
      - *name:* field's path.
      - *label:* used to display useful information about the result (for instnace, where the string searched was found).
  - *Relations:* used to retrive related information from other collections and save it in the same document. It makes searchs much easier.
      - *fieldName:* name of the field where the information retrived is saved.
      - *valuePath:* the name of the field that containt the related information.
      - *collection:* mongo collection where the data is retrived.
      - (Optional) *idField:* if it's defined then the relation defined is inverted. That changes the meaning of the previous fields. TODO

# Client side

**Example**
```javascript
Collection.esSearch('something to search', filter, function (err, result) {
    // do whatever you want here
});
```

**esSearch** 
It's a method defined on each collection synchronized with *ES.syncCollection*.
Parameters:
  - *searchString:* string used to create the query.
  - *filter:* Use the same syntax as Elasticsearch ([check it here](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-filters.html "ES doc")). For instance: filter by hierId
  - *callback*: function called with two parameters, error and result. Error specify if somthing goes wrong. Result is an array with the result from elasticsearch and some useful information about the search for each hit, for instance, it highlightes where the search string was found for each fields that match.


# TODO
  - Easier way to define filters on client side.
  - Find a better way to separate hieararchies data.

