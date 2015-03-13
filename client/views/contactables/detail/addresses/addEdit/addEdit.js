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

var addressDep = new Deps.Dependency();
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
Template.addressAddEdit.created = function() {
    var self = this;
    address.addressTypeId = Utils.getAddressTypeDefault()._id;
    if (self.data.location) address=self.data.location;
    AutoForm.hooks({
        addressAddEditForm: {
            onSubmit: function (insertDoc, updateDoc, currentDoc) {
                addDisabled.set(true);
                var selfautoform = this;
                //Copy properties from insert doc into current doc which has lat lng
                for (var k in insertDoc) currentDoc[k] = insertDoc[k];
                //Set the contactable id on the current doc
                currentDoc.linkId = Session.get("entityId");
                Meteor.call('addEditAddress', currentDoc, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        resetAddress();
                        selfautoform.resetForm();
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
    resetAddress();
};
Template.addressAddEdit.helpers({
    address: function () {
        addressDep.depend();
        return address;
    },
    addDisabled: function () {
        return addDisabled.get();
    },
    searchInputOptions: function () {
        return {
            onChange: function (selectedAddress) {
                debugger;
                //resetAddress();
                // keep address type
                selectedAddress.addressTypeId = address.addressTypeId;
                address = selectedAddress;
                addressDep.changed();

                //AutoForm.invalidateFormContext("addressAddEditForm");

            }
        };
    }
});


