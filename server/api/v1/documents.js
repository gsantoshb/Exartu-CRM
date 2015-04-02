var fs = Meteor.npmRequire('fs');

Router.map(function() {
	this.route('apiDocuments' + api_version, {
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
          console.log('request',this.request);
					var data = {};

					_.extend(data, this.request.fields || this.request.body);
					_.extend(data, this.request.files.file);

					if (!data.path)
						response.error('File required');

					if (!data.entityId)
						response.error('EntityId required');						

					try {
						var doc = connection.call('apiInsertDocument', data);
	      		response.end(mapper.get(doc));
      		} catch(err) {
      			response.error('Oh no! Something has gone wrong');
      		}
					break;

				case 'GET': 
					var data = this.params.query;

					if (!data.entityId)
						response.error('EntityId is required');
					
					var documents = ContactablesFiles.find({entityId: data.entityId}).map(mapper.get);
					response.end(documents, {type: 'application/json'});
					break;
				default:
					response.error('Method not supported');
			}

			connection.close();
		}
	})
});

Meteor.methods({
	apiInsertDocument: function(data) {
    var stream = fs.createReadStream(data.path);
		var res = Meteor.wrapAsync(stream.once, stream)('readable');
		var streamSize = stream._readableState.length;

    var fileId = S3Storage.upload(stream);
		var file = {
      fileId: fileId,
			owner: Meteor.userId(),
			entityId: data.entityId,
			tags: data.tags || [],
			hierId: Meteor.user().hierId,
			name: data.name,
			description: data.description,
			size: streamSize
		};

		var docId = ContactablesFiles.insert(file);
		return ContactablesFiles.findOne(docId);
	}
});

var mapper = {
	get: function(data) {
		if (!data)
			return {}
		return {
			id: data._id,
			name: data.name,
			description: data.description,
			size: data.size,
			tags: data.tags
		}
	}
};