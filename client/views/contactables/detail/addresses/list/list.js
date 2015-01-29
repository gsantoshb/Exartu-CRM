/**
 * Created by visualaram on 1/27/15.
 */
Template.addressList.helpers({
  addresses: function () {
    var addresses =  Addresses.find({'contactableId': Session.get('entityId')});
    return addresses;
  }
});