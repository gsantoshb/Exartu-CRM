Router.map(function() {
	this.route('apiEmployees', {
		where: 'server',
		path: '/api/' + api_version + '/employees/:id?',
		action: function() {
			console.log('API v' + api_version + '/employees ' + this.request.method);

			// Get login token from request
			var loginToken = RESTAPI.getLoginToken(this);			 
			// Return user associated to loginToken if it is valid.			
			var user = RESTAPI.getUserFromToken(loginToken);			
			// Create a DPP connection with server and attach user
			var connection = new RESTAPI.connection(user);

			var response = new RESTAPI.response(this.response);

			switch(this.request.method) {
				case 'GET':
					if (this.params.id)
						response.end(mapper.get(Contactables.findOne({_id: this.params.id, objNameArray: 'Employee', hierId: user.hierId})), {type: 'application/json'});
					else
						response.end(Contactables.find({objNameArray: 'Employee', hierId: user.hierId}).map(mapper.get), {type: 'application/json'});
				 	break;

				// Crete new employee
				// Body:
				//   - firstName: string
				// 	 - lastName: string
				// 	 - middleName: string (optional)
				//	 - jobTitle: string (optional)
				// 	 - salutation: string (optional)
				// 	 - status: string (optional)
				case 'POST':
					var contactable = mapper.create(this.request.body);

					try {
						var employeeId = connection.call('addContactable', contactable);
						response.end({employeeId: employeeId});
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

var mapper = {
	create: function(data) {
		return {
			objNameArray: [ 'person', 'Employee', 'contactable' ],
			person:  {
				firstName: data.firstName || '',
				lastName: data.lastName || '',
				middleName: data.middleName || '',
				jobTitle: data.jobTitle || '',
			},
			Employee: {
				statusNote: data.status || ''
			}
		};
	},
	get: function(data) {
		if (!data)
			return {}
		return {
			firstName: data.person.firstName,
			lastName: data.person.lastName,
			middleName: data.person.middleName,
			jobTitle: data.person.jobTitle,
			status: data.Employee.statusNote
		}
	}
};