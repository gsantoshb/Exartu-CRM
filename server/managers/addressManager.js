
AddressManager = {
  addEditAddress: function(addressInfo) {
    // Validation
    if (! addressInfo) { throw new Error('Address information is required'); }
    Addresses.insert(addressInfo);
  },
  removeAddress: function(id) {
    Addresses.remove({_id:id});
  }

};

