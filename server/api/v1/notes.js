Router.map(function() {
	this.route('apiNotes' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/notes',
		action: function() {
			console.log('API v' + api_version + '/notes ' + this.request.method);

			// Get login token from request
			var loginToken = RESTAPI.getLoginToken(this);			 
			// Return user associated to loginToken if it is valid.			
			var user = RESTAPI.getUserFromToken(loginToken);			
			// Create a DPP connection with server and attach user
			var connection = new RESTAPI.connection(user);

			var response = new RESTAPI.response(this.response);

			switch(this.request.method) {
				// Get notes for an entity by ID
				// Parameters:
				//  - entityId: string
				case 'GET':
					var entityId = this.params.query.entityId;
					try {
						var res = connection.call('apiGetNotes', entityId);

						// Transform the response before sending it back
						res = mapper.get(res);
						response.end(res);
					} catch(err) {
						console.log(err);
						response.error(err.message);
					}
					break;

				// Add a new note for a contactable
				// Body:
				//  - msg: string
				//  - link: string  // contactable ids
				//  - dateCreated: string (date) ?
				//  - externalId: string ?
				case 'POST':
					var data = this.request.bodyFields;

					try {
						var note = mapper.create(data);
						var noteId = connection.call('apiAddNote', note);
						_.extend(data, {id: noteId});
						console.log('api notes insert response data', JSON.stringify(data));
						response.end(data);
					} catch(err) {
						console.log(err);
						response.error(err);
					}
					break;

				default:
					response.error('Method not supported');
			}

			connection.close();
		}
	})
});

var mapper = {
	create: function(data) {
		var note = {
			msg: data.msg,
			link: data.link
		};

		// Optional values
		if (data.dateCreated) { note.dateCreated = data.dateCreated; }
		if (data.externalId) { note.externalId = data.externalId; }

		return note;
	},
	get: function(data) {
		if (!data) return {};

		var result = [];
		_.each(data, function (item) {
			var res = {
				id: item._id,
				msg: item.msg,
				link: item.links[0].id
			};

			// Optional values
			if (item.dateCreated) { res.dateCreated = item.dateCreated; }
			if (item.externalId) { res.externalId = item.externalId; }

			result.push(res);
		});

		return result;
	}
};