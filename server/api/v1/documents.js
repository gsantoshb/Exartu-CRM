Router.map(function() {
	this.route('apiDocuments', {
		where: 'server',
		path: '/api/' + api_version + '/documents',
		action: function() {
			console.log('API v' + api_version + '/documents ' + this.request.method);

			// Get login token from request
			var loginToken = RESTAPI.getLoginToken(this);			 
			// Return user associated to loginToken if it is valid.			
			var user = RESTAPI.getUserFromToken(loginToken);			
			// Create a DPP connection with server and attach user
			var connection = new RESTAPI.connection(user);

			var response = new RESTAPI.response(this.response);

			switch(this.request.method) {
				// Create a document for a specific contactable
				// Params:
				//   - entityId: string (Contactable Id)
				// 	 - name: string
				//	 - description: string (optional)
				// 	 - tags: array (optional)
				case 'POST':
					var data = {};

					_.extend(data, this.request.fields || this.request.body);
					_.extend(data, this.request.files.file);

					if (!data.path)
						response.error('File required');

					if (!data.entityId)
						response.error('EntityId required');						

					try {
						var doc = connection.call('apiInsertDocument', data);
						var responseMessage = {documentId: doc._id};
	      		response.end(responseMessage);
      		} catch(err) {
      			response.error('Oh no! Something has gone wrong');
      		}
					break;

				default:
					response.error('Method not supported');
			}
		}
	})
});

Meteor.methods({
	apiInsertDocument: function(data) {
		var file = new FS.File(data.path);
		file.metadata = {
			owner: Meteor.userId(),
			entityId: data.entityId,
			tags: data.tags || [],
			hierId: Meteor.user().hierId,
			name: data.name,
			description: data.description
		};
		return ContactablesFS.insert(file);
	}
})