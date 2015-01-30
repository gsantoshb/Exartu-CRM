/**
 * Created by visualaram on 1/27/15.
 */
var showLocationEditBox = new ReactiveVar(false);
var showLocationAddBox = new ReactiveVar(false);
var addressesDep = new Deps.Dependency();
Template.addressList.helpers({
    addresses: function () {
        var addresses = Addresses.find({'linkId': Session.get('entityId')});
        addressesDep.depend();
        return addresses;
    },
    getAddressTypeDisplayName: function () {
        var lkp = LookUps.findOne({_id: this.addressTypeId});
        return lkp.displayName;
    },
    setNewAddress: function () {
        return function (address) {
            address.linkId=Session.get('entityId');

            console.log('addr add ed  ',address);
            Meteor.call('addEditAddress', address, function (err, result) {
                console.log('addedit',address);
                if (err) {
                    alert(err);
                    console.log(err)
                }
                else {
                    addressesDep.changed();
                    showLocationEditBox.set(false);
                    showLocationAddBox.set(false);
                }
            });
        }
    },
    showLocationEditBox: function () {
        return showLocationEditBox.get();
    },
    showLocationAddBox: function () {
        return showLocationAddBox.get();
    },
    linkId: function() { return Session.get('entityId');}
});
Template.addressList.events({

    'click .deleteAddressRecord': function () {
        Meteor.call('removeAddress', this._id, function (err, result) {
            if (err) {
                console.log(err);
            } else {

            }
            addressesDep.changed();

        });
        return false;
    },
    'click .editAddressRecord': function () {
        showLocationEditBox.set(!showLocationEditBox.get());
    },
    'click #create-address-mode': function () {
        showLocationAddBox.set(!showLocationAddBox.get());
    }
});