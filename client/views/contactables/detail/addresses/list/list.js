/**
 * Created by visualaram on 1/27/15.
 */
var locationFormBoxType = new ReactiveVar(); // possible values: insert & update
var showLocationFormBox = new ReactiveVar(false);
var newLocationButtonIcon = new ReactiveVar('fa-plus');

var loadedAddress = new ReactiveVar({});

var addressesDep = new Deps.Dependency();

Template.addressList.helpers({
    addresses: function () {
        var contactable = Contactables.findOne({_id: Session.get('entityId')});
        addressesDep.depend();
        return contactable.addresses;
    },
    getAddressTypeDisplayName: function () {
        var lkp = LookUps.findOne({_id: this.addressTypeId});
        return lkp.displayName;
    },
    setNewAddress: function (error, result) {
        return function () {
            addressesDep.changed();
            locationFormBoxType.set('update');
        }
    },
    locationFormBoxType: function() {
      return locationFormBoxType.get();
    },
    showLocationFormBox: function() {
        return Session.get( 'showLocationFormBox' );
    },
    newLocationButtonIcon: function() {
        return newLocationButtonIcon.get();
    },
    formId: function(){
        return formId.get();
    },
    loadedAddress: function() {
        Session.set( 'address', loadedAddress.get() );
        return loadedAddress.get();
    },
    linkId: function() { return Session.get('entityId');
    },
    isAdmin: function(){
        return Utils.adminSettings.isAdmin();
    }
});
Template.addressList.events({
    'click .deleteAddressRecord': function () {
        if (!confirm('Delete this address record?')) return;
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
        var location = this;
        newLocationButtonIcon.set('fa-plus');

        if( locationFormBoxType.get() == 'update' ){
            locationFormBoxType.set(undefined);
            loadedAddress.set({});
        }

        locationFormBoxType.set('update');
        loadedAddress.set(location);
        //showLocationFormBox.set(true);
        Session.set( 'showLocationFormBox',  true);
    },
    'click #create-address-mode': function () {
        if( locationFormBoxType.get() == 'insert' ){
            locationFormBoxType.set(undefined);
            //showLocationFormBox.set(false);
            Session.set( 'showLocationFormBox',  false);
            newLocationButtonIcon.set('fa-plus');
        }
        else{

            locationFormBoxType.set('insert');
            //showLocationFormBox.set(true);
            Session.set( 'showLocationFormBox',  true);
            newLocationButtonIcon.set('fa-remove');
            loadedAddress.set({});
        }

        Session.set( 'address', loadedAddress.get() );
    }
});