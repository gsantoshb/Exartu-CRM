LocationSchema = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    linkId: {
        type: String,
        optional: true
    },
    addressTypeId: {
        type: String,
        optional: false
    },
    address: {
        type: String,
        label: 'Address line 1',
        optional: true
    },
    address2: {
        type: String,
        label: 'Address line 2',
        optional: true
    },
    streetNumber: {
        type: String,
        label: 'Street Number',
        optional: true
    },
    city: {
        type: String,
        label: 'City',
        optional: true
    },
    state: {
        type: String,
        label: 'State',
        optional: true
    },
    country: {
        type: String,
        label: 'Country',
        optional: true
    },
    postalCode: {
        type: String,
        label: 'Postal/Zip',
        optional: true
    }
});

var address = {
    _id: undefined,
    addressTypeId: undefined,
    linkId: undefined,
    address: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
};

var resetAddress = function () {
    address.addressTypeId = Utils.getAddressTypeDefault()._id;
    address.linkId = undefined;
    address.address = '';
    address.address2 = '';
    address.city = '';
    address.state = '';
    address.country = '';
    address.postalCode = '';
};

var addressCreatedCallback;

var addDisabled = new ReactiveVar(false);
var formId = new ReactiveVar('addressAddEditForm');
var formType = new ReactiveVar('insert');

Template.addressAddEdit.created= function() {
    var self = this;
    address.addressTypeId=Utils.getAddressTypeDefault()._id;
    if (self.data.location) address=self.data.location;

    formId = 'addressAddEditForm-' + self.data.formId;

    AutoForm.hooks({
        addressAddEditForm: {
            onSubmit: function (insertDoc, updateDoc, currentDoc) {
                addDisabled.set(true);
                var selfautoform=this;
                var doFormReset = true;
                //Copy properties from insert doc into current doc which has lat lng
                for (var k in insertDoc) currentDoc[k] = insertDoc[k];
                //Set the contactable id on the current doc
                currentDoc.linkId = Session.get("entityId");

                if(currentDoc._id)
                    doFormReset = false;

                Meteor.call('addEditAddress', currentDoc, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        if(doFormReset){
                            resetAddress();
                            selfautoform.resetForm();
                        }
                        self.data.callback && self.data.callback();
                    }
                    selfautoform.done();
                });
                addDisabled.set(false);
                return false;
            }
        }
    });
};

Template.addressAddEdit.rendered = function () {
    var self = this;

    //resetAddress();
    var inputElement = this.$('.locationSearchInput')[0];
    var autocomplete = new google.maps.places.Autocomplete(inputElement, {types: ['geocode']});
    // When the user selects an address from the dropdown this event is raised
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var place = autocomplete.getPlace();
        //Convert the place from google to our address

        placeToAddress(place);

        //Invalidate form to refresh bindings
        AutoForm.invalidateFormContext("addressAddEditForm");
        inputElement.value = '';
    });
    //gets an object containing the address data from the autocomplete place result
    var placeToAddress = function (place) {
        resetAddress();
        var componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'long_name',
            postal_code: 'short_name'
        };

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var componentType = place.address_components[i].types[0];
            if (componentForm[componentType]) {
                var val = place.address_components[i][componentForm[componentType]];
                switch (componentType) {
                    case 'street_number':
                        address.address = val;
                        break;
                    case 'route':
                        address.address = address.address + ' ' + val;
                        break;
                    case 'locality':
                        address.city = val;
                        break;
                    case 'administrative_area_level_1':
                        address.state = val;
                        break;
                    case 'country':
                        address.country = val;
                        break;
                    case 'postal_code':
                        address.postalCode = val;
                        break;
                }
            }
        };

        address.lat = place.geometry.location.lat();
        address.lng = place.geometry.location.lng();
    };
};

Template.addressAddEdit.helpers({
    address: function () {
        //testAddress.set( Session.get( 'address' ) );
        //return testAddress.get();
        address = Session.get( 'address' );
        return address;
    },
    formId: function () {
        return formId;
    },
    formType: function () {
        if (address._id) {
            return "update";
        } else {
            return "insert";
        }
    },
    //testAddress: function(){
    //    testAddress.set( Session.get( 'address' ) );
    //    return testAddress.get();
    //},
    getAddressTypes: function () {
        addressTypes = Utils.getAddressTypes();
        return _.map(addressTypes, function (addresstype) {
            return {label: addresstype.displayName, value: addresstype._id};
        });
    },
    addDisabled: function () {
        return addDisabled.get();
    }
});