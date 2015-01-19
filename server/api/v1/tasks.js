Router.map(function() {
	this.route('apiTasks' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/tasks',
		action: function() {
			console.log('API v' + api_version + '/tasks ' + this.request.method);

			// Get login token from request
			var loginToken = RESTAPI.getLoginToken(this);			 
			// Return user associated to loginToken if it is valid.			
			var user = RESTAPI.getUserFromToken(loginToken);			
			// Create a DPP connection with server and attach user
			var connection = new RESTAPI.connection(user);

			var response = new RESTAPI.response(this.response);

			switch(this.request.method) {
				// Get tasks for an entity by ID
				// Parameters:
				//  - entityId: string
				case 'GET':
					var entityId = this.params.query.entityId;
					try {
						var res = connection.call('apiGetTasks', entityId);

						// Transform the response before sending it back
						res = mapper.get(res);
						response.end(res);
					} catch(err) {
						console.log(err);
						response.error(err.message);
					}
					break;

				// Add a new task for a contactable
				// Body:
				//  - msg: string
				//  - begin: string (date) ?
				//  - end: string (date) ?
				//  - assign: string ? // user assigned
				//  - link: string  // contactable ids
				//  - dateCreated: string (date) ?
				//  - externalId: string ?
				case 'POST':
					var data = this.request.bodyFields;

					try {
						var task = mapper.create(data, user);
						var taskId = connection.call('apiAddTask', task);
						_.extend(data, {id: taskId});
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
	create: function(data, user) {
		var task = {
			msg: data.msg,
			begin: data.begin || new Date(),
			assign: [data.assign || user._id],
			link: data.link
		};

		// Optional values
		if (data.end) { task.end = data.end; }
		if (data.dateCreated) { task.dateCreated = data.dateCreated; }
		if (data.externalId) { task.externalId = data.externalId; }

		return task;
	},
	get: function(data) {
		if (!data) return {};

		var result = [];
		_.each(data, function (item) {
			var res = {
				id: item._id,
				msg: item.msg,
				begin: item.begin,
				assign: item.assign[0],
				link: item.links[0].id
			};

			// Optional values
			if (item.end) { res.end = item.end; }
			if (item.dateCreated) { res.dateCreated = item.dateCreated; }
			if (item.externalId) { res.externalId = item.externalId; }

			result.push(res);
		});

		return result;
	}
};