/**
 * Created by visualaram on 1/27/15.
 */
Meteor.methods({
    addEditAddress: function (addr) {
        return AddressManager.addEditAddress(addr);
    },
    removeAddress: function (id) {
        AddressManager.removeAddress(id);
    },
    getAddress: function (contactableid, addresstype) {
        return AddressManager.getAddress(contactableid, addresstype);
    }
});