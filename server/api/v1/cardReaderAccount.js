Router.map(function() {
	this.route('apiCardReader' + api_version, {
		where: 'server',
		path: '/api/' + api_version + '/cardReaderAccount',
		action: function() {
			console.log('API v' + api_version + '/cardReaderAccount ' + this.request.method);

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
					try {
						var res = connection.call('getCardReaderConfiguration');

						// Transform the response before sending it back
						console.log('res', res);
						response.end(res);
					} catch(err) {
						console.log(err);
						response.error(err.message);
					}
					break;

				default:
					response.error('Method not supported');
			}

			connection.close();
		}
	})
});