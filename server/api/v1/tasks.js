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
				case 'GET':
					var selector = {
						hierId: user.hierId
					};

					var id = this.params.entityId;
					if (id)
						selector['links.id'] = id

					response.end(Tasks.find(selector).map(mapper.get), {type: 'application/json'});

				 	break;

				// Crete new task
				// Body:
				//   - msg: string
				//	 - begin: date,
				//	 - end: date,
				//	 - assign: string // user assigned
				// 	 - links: [ string ] // contactable ids related
				case 'POST':
					var data = this.request.body;

					try {
						var task = mapper.create(data, user);
						var taskId = connection.call('apiInsertTask', task);
						_.extend(data, {id: taskId});
						response.end(data);
					} catch(err) {
						console.log(err)
						response.error(err);
					}
					break;

				default:
					response.error('Method not supported');
			}
		}
	})
});

Meteor.methods({
	apiInsertTask: function(task) {
		return Tasks.insert(task);
	}
});

var mapper = {
	create: function(data, user) {
		if (!data.links)
			throw new Meteor.Error(500, 'Links are required');

		data.begin = data.begin || new Date();
		data.assign = data.assign || user._id;

		return {
			msg: data.msg,
			begin: data.begin,
			end: data.end,
			assign: [data.assign],
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
			begin: data.begin,
			end: data.end,
			assign: data.assign[0],
			links: _.map(data.links, function(link){
				return link.id;
			})
		}
	}
};