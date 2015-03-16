Template.addressAddEditFormContent.helpers({
  getAddressTypes: function () {
    if (this.addressTypes){
      return this.addressTypes;
    }
    var addressTypes = Utils.getAddressTypes();
    return _.map(addressTypes, function (addresstype) {
      return { label: addresstype.displayName, value: addresstype._id };
    });
  }
})
