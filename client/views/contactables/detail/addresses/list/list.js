/**
 * Created by visualaram on 1/27/15.
 */
var showLocationEditBox = new ReactiveVar(true);
var showLocationAddBox = new ReactiveVar(false);
var addressesDep = new Deps.Dependency();
Template.addressList.helpers({
    addresses: function () {
        var addresses = Addresses.find({'linkId': Session.get('entityId')});
        console.log(addresses);
        addressesDep.depend();
        return addresses;
    },
    getAddressTypeDisplayName: function () {
        if (!this.addressTypeId) {
            console.log('missing addresstypeid on address');
            return "";
        }
        var lkp = LookUps.findOne({_id: this.addressTypeId});
        return lkp.displayName;
    },
    setNewAddress: function () {
        //debugger;
        return function () {
            addressesDep.changed();
            showLocationEditBox.set(false);
            showLocationAddBox.set(false);
        }
    },
    showLocationEditBox: function () {
        return showLocationEditBox.get();
    },
    showLocationAddBox: function () {
        return showLocationAddBox.get();
    },
    linkId: function () {
        return Session.get('entityId');
    },
    isAdmin: function () {
        return Utils.adminSettings.isAdmin();
    }
});
Template.addressList.events({

    'click .deleteAddressRecord': function () {
        var self = this;
        Utils.showModal('basicModal', {
            title: 'Delete?',
            message: 'Delete this address record?',
            buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
                label: 'Delete',
                classes: 'btn-success',
                value: true
            }],
            callback: function (result) {

                if (result) {

                    Meteor.call('removeAddress', self._id, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {

                        }
                        addressesDep.changed();
                    });
                }
            }
        });
        return false;
    },
    'click .editAddressRecord': function () {
        var self = this;
        $('#address-' + $(this).attr('data-addressId')).hide();
        showLocationEditBox.set(!showLocationEditBox.get());
    },
    'click #create-address-mode': function () {
        showLocationAddBox.set(!showLocationAddBox.get());
    }
});