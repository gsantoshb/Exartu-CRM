var address = new ReactiveVar(),
  addDisabled = new ReactiveVar(false),
  worksiteAddress = new ReactiveVar();

var resetAddress = function () {
  address.set({
    addressTypeId: worksiteAddress.get() && worksiteAddress.get().value
  });
};

Template.jobAddressAddEdit.created = function () {
  var self = this;

  var addressTypes = Utils.getAddressTypes();
  var addressType = _.find(addressTypes, function (addType) {
    return _.contains(addType.lookUpActions, Enums.lookUpAction.Address_WorksSite);
  });
  worksiteAddress.set({ label: addressType.displayName, value: addressType._id });

  resetAddress();

  AutoForm.hooks({
    jobAddressAddEditForm: {
      onSubmit: function (insertDoc, updateDoc, currentDoc) {
        addDisabled.set(true);
        var selfautoform = this;

        //Copy properties from insert doc into current doc which has lat lng
        for (var k in insertDoc) currentDoc[k] = insertDoc[k];
        //Set the contactable id on the current doc
        currentDoc.linkId = Session.get("entityId");

        Meteor.call('setJobAddress', Session.get("entityId"), currentDoc, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            resetAddress();

            selfautoform.resetForm();

            self.data.callback && self.data.callback();
          }
          selfautoform.done();
          addDisabled.set(false);
        });
        return false;
      }
    }
  });
};

Template.jobAddressAddEdit.helpers({
  searchInputOptions: function () {
    return {
      onChange: function (add) {
        address.set(add);
      }
    };
  },
  address: function () {
    console.log('address', address.get());
    return address.get();
  },
  addDisabled: function () {
    return addDisabled.get();
  },
  jobAddressTypes: function () {
    return [worksiteAddress.get()]
  }
});