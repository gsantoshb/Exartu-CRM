/**
 * Created by visualaram on 1/27/15.
 */
Meteor.methods({
  addAddressToContactable: function (addressInfo) {
    return AddressManager.addAddressToContactable(addressInfo);
  }
});