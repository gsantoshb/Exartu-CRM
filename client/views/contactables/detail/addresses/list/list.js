/**
 * Created by visualaram on 1/27/15.
 */
var addressesDep=new Deps.Dependency();
Template.addressList.helpers({
  addresses: function () {
    var addresses =  Addresses.find({'linkId': Session.get('entityId')});
    addressesDep.depend();
    return addresses;
  },
  getAddressTypeDisplayName: function(){
    console.log('this',this);
    var lkp = LookUps.findOne({_id: this.addressTypeId});
    return lkp.displayName;
  }
});
Template.addressList.events({

  'click .deleteAddressRecord': function(){
    Meteor.call('removeAddress', this._id, function (err, result) {
      if (err) {
        console.log(err);
      } else {

      }
      addressesDep.changed();

    });
    return false;
  }
});