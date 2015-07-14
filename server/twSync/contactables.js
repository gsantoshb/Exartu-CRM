
// Addresses
Addresses.after.insert(function (userId, address) { syncAddress(address); });
Addresses.after.update(function (userId, address, fieldNames, modifier) { syncAddress(address); });
var syncAddress = function (address) {
  var contactable = Contactables.findOne(address.linkId, {fields:{_id: 1, hierId: 1, externalId: 1, Employee: 1}});

  // Skip contactables with the skip flag set
  if (contactable && !contactable.skipTwSync) {

    // Sync only when an account has been set up for the contactable hier and the contactable has been sync
    if (contactable && contactable.externalId) {
      var hier = Hierarchies.findOne(contactable.hierId);
      if (hier && hier.enterpriseAccount) {
        // Set up account info for the helper
        var accountInfo = {
          hierId: hier._id,
          username: hier.enterpriseAccount.username,
          password: hier.enterpriseAccount.password,
          accessToken: hier.enterpriseAccount.accessToken,
          tokenType: hier.enterpriseAccount.tokenType
        };

        var data = {};
        data.address = address.address;
        data.address2 = address.address2;
        data.city = address.city;
        data.zip = address.postalCode;

        // Try to find the state code that matches the string name
        var state = _.find(StateCodes, function (state) {
          return state.name.toLowerCase() == address.state.toLowerCase()
        });
        if (state) data.state = state.code;

        // Update Employee
        if (contactable.Employee) {
          TwApi.updateEmployee(contactable.externalId, data, accountInfo);
        }
      }
    }
  }
};