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

Router.map(function() {
	this.route('apiContactsAndLogin' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/twwpapi/:id?',
		action: function() {
			console.log('API v' + api_version + '/twwpapi ' + this.request.method);

      if (this.request.bodyFields){
        var loginData = {
          email : this.request.bodyFields.userEmail,
          password : this.request.bodyFields.userPassword
        };
        var userData = RESTAPI.loginAction(loginData);

        contactablesAPIAction.call(this, 'Contact', userData);
      }
		}
	})
});

var contactablesAPIAction = function(type, userdata) {
  var udata = userdata || {};

	// Get login token from request
	var loginToken = udata.loginToken || RESTAPI.getLoginToken(this);
	// Return user associated to loginToken if it is valid.
	var user = udata.userId ? Meteor.users.findOne(udata.userId) : RESTAPI.getUserFromToken(loginToken);
	// Create a DPP connection with server and attach user
	var connection = new RESTAPI.connection(user);

	var response = new RESTAPI.response(this.response);

	switch(this.request.method) {
		case 'GET':
			if (this.params.query.id)
				response.end(mapper.get(Contactables.findOne({_id: this.params.query.id, objNameArray: type, hierId: user.hierId}), type), {type: 'application/json'});
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
		// 	 - externalId: string (optional)
		case 'POST':
			var data = this.request.bodyFields;
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

	connection.close();
};

var mapper = {
	create: function(data, type) {
		var contactable = {
			objNameArray: ['contactable', type]
		};

		var personFields = ['firstName', 'lastName', 'middleName', 'jobTitle'];

		// Check if it's a person
		// might be sending over a person with a blank or null last and first name so check if those fields exist
		// and if so set them to NA (not available)
		var isPerson = _.some(personFields, function (fieldName) {
			if (data[fieldName]==null || data[fieldName]=='') data[fieldName]='NA';
			return !! data[fieldName]  ;
		});

		if (isPerson)
			contactable.objNameArray.push('person');

		_.forEach(personFields, function(personField) {
			if (data[personField]) {
				contactable.person = contactable.person || {};
				contactable.person[personField] = data[personField];
			}
		});

		var organizationFields = ['organizationName', 'department'];

		// Check if it's an organization
		var isOrganization = _.some(organizationFields, function (fieldName){
			return !! data[fieldName];
		});

		if (isOrganization)
			contactable.objNameArray.push('organization');

		_.forEach(organizationFields, function(organizationField) {
			if (data[organizationField]) {
				contactable.organization = contactable.organization || {};
				contactable.organization[organizationField] = data[organizationField];
			}
		});

		contactable[type] = {
			statusNote: data.status || ''
		};

    //if(data.email){
    //  var emailTypeId = ContactMethods.findOne({
    //    hierId: ExartuConfig.TenantId,
    //    type: Enums.contactMethodTypes.email
    //  });
    //  if (emailTypeId){
    //    emailTypeId = emailTypeId._id;
    //    contactable.contactMethods = [{
    //      type: emailTypeId,
    //      value: data.email
    //    }]
    //  }
    //}
    //if(data.phoneNumber){
    //  var phoneTypeId = ContactMethods.findOne({
    //    hierId: ExartuConfig.TenantId,
    //    type: Enums.contactMethodTypes.phone
    //  });
    //
    //  if (phoneTypeId){
    //    phoneTypeId = phoneTypeId._id;
    //    contactable.contactMethods = contactable.contactMethods || [];
    //    contactable.contactMethods.push({
    //      type: phoneTypeId,
    //      value: data.phoneNumber
    //    });
    //  }
    //}

		if (type == 'Contact') {
			if (data.customerId)
				contactable.customerId = data.customerId;
		}

		//department
		if (type == 'Customer') {
			if (data.department){
				contactable.Customer = contactable.Customer || {};
				contactable.Customer.department = data.department;
			}
		}

		//ExternalId
		if (data.externalId){
			contactable.externalId = data.externalId;
		}

		//SSN
		if (data.ssn){
			contactable.Employee = contactable.Employee || {};
			contactable.Employee.taxID = data.ssn;
		}

		//tags
		if (data.tags && _.isArray(data.tags)){
			contactable.tags = data.tags;
		}

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

		if (type == 'Contact') {
			if (data.customerId)
				contactable.customerId = data.customerId;
		}

		//department
		if (type == 'Customer') {
			if (data.department){
				contactable.department = data.Customer.department;
			}
		}

		//ExternalId
		if (data.externalId){
			contactable.externalId = data.externalId;
		}

		//SSN
		if (data.Employee && data.Employee.taxID){
			contactable.ssn = data.Employee.taxID;
		}

		//tags
		if (data.tags){
			contactable.tags = data.tags;
		}
		return contactable;
	}
};


