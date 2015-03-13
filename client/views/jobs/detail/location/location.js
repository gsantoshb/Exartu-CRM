
var isAdding, jobId;
Template.jobLocation.created = function () {
  isAdding = new ReactiveVar(false);

  jobId = Session.get('entityId');

  if (! jobId){
    console.warn('jobLocation called from outside a job');
    return;
  }
};

Template.jobLocation.helpers({
  isAdding: function () {
    return isAdding.get();
  },
  addressId: function () {
    console.log('addressId')
    return {
      addressId: this.address
    };
  }
});

Template.jobLocation.events({
  'click #add-address-mode': function (e, ctx) {
    isAdding.set(! isAdding.get());
  }
});


//////////////////////////
///// displayJobAddress /////
//////////////////////////

var subHandler,
  addressId = new ReactiveVar(null);
Template.displayJobAddress.created = function () {
  var data = this.data;

  Meteor.autorun(function () {
    var job = Jobs.findOne(data.jobId);
    addressId.set(job.address);
    subHandler = Meteor.subscribe('singleAddress', job.address);
  });
};

Template.displayJobAddress.helpers({
  addresses: function () {
    return Addresses.find({_id: addressId.get()});
  },
  canEdit: function () {
    var templateContext = Template.instance();
    return Utils.adminSettings.isAdmin() && (this.linkId == templateContext.data.jobId);
  }
});

Template.displayJobAddress.events({

});

Template.displayJobAddress.destroyed = function () {
  subHandler.stop();
};

///////////////////////////

Template.smallAddress.helpers({
  getAddressTypeDisplayName: function () {
    if (!this.addressTypeId) {
      console.log('missing addresstypeid on address');
      return "";
    }
    var lkp = LookUps.findOne({_id: this.addressTypeId});
    return lkp.displayName;
  }
});

//////////////////////////
///// addJobLocation /////
//////////////////////////

var addJobLocation = {
  customLocation: null,
  selected: null,
  sending: null,
  subHandler: null
};
Template.addJobLocation.created = function () {
  var data = this.data;

  if (! data || ! data.client){
    return console.warn('addJobLocation called from outside a job');
  }

  addJobLocation.customLocation = new ReactiveVar(false);
  addJobLocation.selected = new ReactiveVar(data.address);
  addJobLocation.sending = new ReactiveVar(false);

  addJobLocation.subHandler = Meteor.subscribe('linkedAddresses', data.client);

};

Template.addJobLocation.helpers({
  customLocation: function () {
    return addJobLocation.customLocation.get();
  },
  customerLocation: function () {
    var worksiteAddressTypes = LookUps.find({lookUpCode: Enums.lookUpCodes.contactable_address, lookUpActions: Enums.lookUpAction.Address_WorksSite}).fetch();

    if (! worksiteAddressTypes || ! worksiteAddressTypes.length) return [];

    return Addresses.find({ linkId: this.client, addressTypeId: {$in: _.pluck(worksiteAddressTypes, '_id')} });
  },
  isSelected: function () {
    return this._id == addJobLocation.selected.get();
  },
  disableSave: function () {
    return ! addJobLocation.selected.get() || addJobLocation.sending.get();
  },
  addEditOptions: function () {
    return {
      callback: function () {
        isAdding.set(false);
      }
    }
  }
});

Template.addJobLocation.events({
  'click #custom-location': function (e, ctx) {
    addJobLocation.customLocation.set(true);
  },
  'click #customer-location': function (e, ctx) {
    addJobLocation.customLocation.set(false);
  },
  'change .selectAddress': function (e, ctx) {
    if (e.target.checked){
      addJobLocation.selected.set(this._id);
    } else {
      addJobLocation.selected.set(null);
    }
  },
  'click #saveCustomAddress': function (e, ctx) {
    var selected = addJobLocation.selected.get();
    if (! selected) return;

    addJobLocation.sending.set(true);
    Meteor.call('setJobAddress', ctx.data._id, selected, function (err, result) {
      if (err){
        console.error(err);
      }
      addJobLocation.sending.set(false);
      isAdding.set(false);
    })
  }
});

Template.addJobLocation.destroyed = function () {
  addJobLocation.subHandler.stop();
};

