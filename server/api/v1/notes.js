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

					var id = this.params.entityId;
					if (id)
						selector['links.id'] = id

					response.end(Notes.find(selector).map(mapper.get), {type: 'application/json'});

					break;
				// Create new note
				// Body:
				//   - msg: string
				// 	 - links: [ string ] // contactable ids
				case 'POST':
					var data = this.request.body;

					try {
						var note = mapper.create(data);
						var noteId = connection.call('apiInsertNote', note);
						_.extend(data, {id: noteId});
						response.end(data);
					} catch(err) {
						console.log(err)
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

Meteor.methods({
	apiInsertNote: function(note) {
		return Notes.insert(note);
	}
});

var mapper = {
	create: function(data) {
		if (!data.links)
			throw new Meteor.Error(500, "Links are required")
		return {
			msg: data.msg,
			links: _.map(data.links, function(link) {
				var entity = Contactables.findOne(link);
				if (!entity)
					throw new Meteor.Error(404, 'Entity with id ' + link + 'not found');
				
				return {
					id: link,
					type: Enums.linkTypes.contactable.value
				}
			})
		};
	},
	get: function(data) {
		if (!data)
			return {}
		return {
			msg: data.msg,
			links: _.map(data.links, function(link){
				return link.id;
			})
		}
	}
};