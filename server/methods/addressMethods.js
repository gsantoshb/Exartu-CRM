/**
 * Created by visualaram on 1/27/15.
 */
Meteor.methods({
  addEditAddress: function (addressInfo) {
    return AddressManager.addEditAddress(addressInfo);
  },
  removeAddress: function(id) {
    AddressManager.removeAddress(id);
  }
});