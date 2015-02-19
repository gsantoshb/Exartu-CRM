Router.map(function () {
    this.route('apiAddresses' + api_version, {
        where: 'server',
        path: '/api/' + api_version + '/addresses/',
        action: function () {
            console.log('API v' + api_version + '/addresses ' + this.request.method);

            // Get login token from request
            var loginToken = RESTAPI.getLoginToken(this);
            // Return user associated to loginToken if it is valid.
            var user = RESTAPI.getUserFromToken(loginToken);
            // Create a DPP connection with server and attach user
            var connection = new RESTAPI.connection(user);

            var response = new RESTAPI.response(this.response);

            switch (this.request.method) {
                // Get address by contactable ID
                // Parameters:
                //  - contactableId: string
                case 'GET':
                    var contactableId = this.params.query.contactableId;
                    try {
                        var res = connection.call('getAddress', contactableId);

                        // Transform the response before sending it back
                        res = mapper.get(res, contactableId);
                        response.end(res);
                    } catch (err) {
                        console.log(err);
                        response.error(err.message);
                    }
                    break;


                // Set the address for a contactable
                // Body:
                //  - contactableId: string
                //  - addressLine1: string
                //  - addressLine2: string
                //  - city: string
                //  - state: string
                //  - country: string
                //  - zip: string (int)
                case 'POST':
                    var data = this.request.bodyFields;
                    try {
                        data.linkId = contactableId;
                        var addressInfo = mapper.create(data);
                        connection.call('addEditAddress', addressInfo);
                        response.end(data);
                    } catch (err) {
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


var mapper = {
    create: function (data) {
        return {
            linkId: data.linkId,
            address: data.addressLine1,
            address2: data.addressLine2,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.zip
        };
    },
    get: function (data, contactableId) {
        if (!data) return {};

        return {
            contactableId: contactableId,
            addressLine1: data.address,
            addressLine2: data.address2,
            city: data.city,
            state: data.state,
            country: data.country,
            zip: data.postalCode
        };

    }
};
