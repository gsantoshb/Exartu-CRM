/**
 * Created by visualaram on 1/27/15.
 */
//var showLocationEditBox = new ReactiveVar(false);
//var showLocationAddBox = new ReactiveVar(false);

var locationFormBoxType = new ReactiveVar(); // possible values: insert & update
var showLocationFromBox = new ReactiveVar(false);
var newLocationButtonIcon = new ReactiveVar('fa-plus');

var loadedAddress = new ReactiveVar({});

var addressesDep = new Deps.Dependency();

Template.addressList.helpers({
    addresses: function () {
        var addresses = Addresses.find({'linkId': Session.get('entityId')});
        addressesDep.depend();
        //console.log(addresses);
        return addresses;
    },
    getAddressTypeDisplayName: function () {
        var lkp = LookUps.findOne({_id: this.addressTypeId});
        return lkp.displayName;
    },
    setNewAddress: function () {
        //debugger;
        return function () {
            addressesDep.changed();
            //showLocationEditBox.set(false);
            //showLocationAddBox.set(false);
            locationFormBoxType.set('update');
        }
    },
    //showLocationEditBox: function () {
    //    return showLocationEditBox.get();
    //},
    //showLocationAddBox: function () {
    //    return showLocationAddBox.get();
    //},
    locationFormBoxType: function() {
      return locationFormBoxType.get();
    },
    showLocationFromBox: function() {
        return showLocationFromBox.get();
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

        //console.log( Session.get( 'address' ) );

        if( locationFormBoxType.get() == 'update' ){
            locationFormBoxType.set(undefined);
            loadedAddress.set({});
        }

        locationFormBoxType.set('update');
        loadedAddress.set(location);
        showLocationFromBox.set(true);

    },
    'click #create-address-mode': function () {
        //showLocationAddBox.set(!showLocationAddBox.get());
        //showLocationAddBox.set(true);
        if( locationFormBoxType.get() == 'insert' ){
            locationFormBoxType.set(undefined);
            showLocationFromBox.set(false);
            newLocationButtonIcon.set('fa-plus');
        }
        else{
            locationFormBoxType.set('insert');
            showLocationFromBox.set(true);
            newLocationButtonIcon.set('fa-remove');
            loadedAddress.set({});
        }

    }
});