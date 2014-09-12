Router.map(function() {
	this.route('apiEmployees' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/employees/:id?',
		action: function() {
			console.log('API v' + api_version + '/employees ' + this.request.method);
			contactablesAPIAction.call(this, 'Employee');
		}
	})
});

Router.map(function() {
	this.route('apiCustomer' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/customers/:id?',
		action: function() {
			console.log('API v' + api_version + '/customers ' + this.request.method);
			contactablesAPIAction.call(this, 'Customer');
		}
	})
});

Router.map(function() {
	this.route('apiContacts' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/contacts/:id?',
		action: function() {
			console.log('API v' + api_version + '/contacts ' + this.request.method);
			contactablesAPIAction.call(this, 'Contact');
		}
	})
});

var contactablesAPIAction = function(type) {
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
				response.end(mapper.get(Contactables.findOne({_id: this.params.id, objNameArray: type, hierId: user.hierId}), type), {type: 'application/json'});
			else
				response.end(Contactables.find({objNameArray: type, hierId: user.hierId}).map(function(contactable) {return mapper.get(contactable, type);}), {type: 'application/json'});
		 	break;

		// Crete new contactable
		// Body:
		//   - firstName: string
		// 	 - lastName: string
		// 	 - middleName: string (optional)
		//	 - jobTitle: string (optional)
		// 	 - salutation: string (optional)
		// 	 - status: string (optional)
		//	 - organizationName: string (optional)
		// 	 - department: string (optional)
		case 'POST':
			var data = this.request.body;
			var contactable = mapper.create(data, type);

			try {
				var contactableId = connection.call('addContactable', contactable);
				_.extend(data, {id: contactableId});
				response.end(data);
			} catch(err) {
				console.log(err)
				response.error(err);
			}
			break;

		default:
			response.error('Method not supported');
	}
};

var mapper = {
	create: function(data, type) {
		var contactable = {
			objNameArray: [ 'person', 'contactable', type],
		};

		_.forEach(['firstName', 'lastName', 'middleName', 'jobTitle'], function(personField) {
			if (data[personField]) {
				contactable.person = contactable.person || {};
				contactable.person[personField] = data[personField];
			}
		});

		_.forEach(['organizationName', 'department'], function(organziationField) {
			if (data[organziationField]) {
				contactable.organization = contactable.organization || {};
				contactable.organization[organziationField] = data[organziationField];
			}
		});

		contactable[type] = {
			statusNote: data.status || ''
		};

		return contactable;
	},
	get: function(data, type) {
		if (!data)
			return {}

		var contactable = {
			id: data._id
		};

		if (data.person) {
			contactable.firstName = data.person.firstName;
			contactable.lastName = data.person.lastName;
			contactable.middleName = data.person.middleName;
			contactable.jobTitle = data.person.jobTitle;
		}
		if (data.organization) {
			contactable.organizationName = data.organization.organizationName;
			contactable.department = data.organization.department;
		}

		return contactable;
	}
};