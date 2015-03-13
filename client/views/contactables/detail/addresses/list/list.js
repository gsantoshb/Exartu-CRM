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
        if (!this.addressTypeId) {
            console.log('missing addresstypeid on address');
            return "";
        }
        var lkp = LookUps.findOne({_id: this.addressTypeId});
        return lkp.displayName;
    },
    setNewAddress: function () {
        return function () {
            addressesDep.changed();
            showLocationEditBox.set(false);
            showLocationAddBox.set(false);
        }
    },
    showLocationEditBox: function () {
        return showLocationEditBox.get() == this._id;
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
        if (showLocationEditBox.get() != this._id){
            showLocationEditBox.set(this._id);
        }else{
            showLocationEditBox.set(null);
        }
    },
    'click #create-address-mode': function () {
        showLocationAddBox.set(!showLocationAddBox.get());
    }
});