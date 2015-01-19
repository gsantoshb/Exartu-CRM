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
				case 'GET':
					var selector = {
						hierId: user.hierId
					};

					var id = this.params.query.entityId;
					if (id)
						selector['links.id'] = id;

					response.end(Notes.find(selector).map(mapper.get), {type: 'application/json'});

					break;

				// Add a new note for a contactable
				// Body:
				//  - msg: string
				//  - link: string  // contactable ids
				//  - dateCreated: string (date) ?
				case 'POST':
					var data = this.request.bodyFields;

					try {
						var note = mapper.create(data);
						var noteId = connection.call('apiAddNote', note);
						_.extend(data, {id: noteId});
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

		return note;
	},
	get: function(data) {
		if (!data)
			return {};
		return {
			msg: data.msg,
			links: _.map(data.links, function(link){
				return link.id;
			}),
			dateCreated: data.dateCreated
		}
	}
};