
AddressManager = {
  addAddressToContactable: function(addressInfo) {
    // Validation
    if (! addressInfo) { throw new Error('Address information is required'); }

    // Contact address insertion
    Addresses.insert(addressInfo, function (err, result) {
      if (err) { throw err; }
      if(addressInfo.addressType == Enums.addressType.business.value)
        {
          Contactables.update({ _id: addressInfo.contactableId }, { $set: { location: addressInfo } }, function (err, result) {
            if (err) { throw err; }
            return result;
          });
        }
      return result;
    });
  },
  getBusinessAddress: function (contactableId) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }

    var address = Addresses.findOne({ _id: contactableId, addressType: Enums.addressType.business });
    return address ? address: {};
  }
};

