
Meteor.methods({
  test_1: function () {
    var res = [];

    // Get the new contact methods
    var contactMethodTypes = [];
    _.each(systemLookUps, function(item) {
      if (item.lookUpCode == Enums.lookUpTypes.contactMethod.type.lookUpCode)
        contactMethodTypes.push(item);
    });

    // Insert the new lookups in each top level hierarchy
    var topLevelHierarchies = Hierarchies.find({ _id: { $ne: ExartuConfig.SystemHierarchyId }, parent: null }).fetch();

    _.each(topLevelHierarchies, function(hierarchy) {
      _.each(contactMethodTypes, function(cmType) {
        cmType.hierId = hierarchy._id;

        res.push(cmType);
        LookUps.insert(cmType);
      });
    });

    return res;
  },

  test_2: function () {
    var res = [];

    // Get previous contact method types
    var oldCMTypes = ContactMethods.find().fetch();

    // Find all the contactables with contact methods
    var contactables = Contactables.find({ contactMethods: { $exists: true } }, { fields: { hierId: 1, person: 1, organization: 1, contactMethods: 1} }).fetch();
    _.each(contactables, function (contactable) {
      // Obtain the root hierarchy for this contactable because the lookups are set at root level
      var rootHier = Utils.getHierTreeRoot(contactable.hierId);

      // Change the type for each contact method
      var updatedContactMethods = [];
      _.each(contactable.contactMethods, function (item) {
        var old = _.find(oldCMTypes, function(cm){ return cm._id === item.type; });
        if (!old) {
          console.log('Old CM type not found. Contactable: [' + contactable._id + '] Type: [' + item.type + ']');
        } else {
          var corresponding = LookUps.findOne({ hierId: rootHier, lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode, displayName: old.displayName });
          if (!corresponding) {
            console.log('The corresponding CM type not found. Contactable: [' + contactable._id + '] DisplayName: [' + old.displayName + ']');
          } else {
            // Add the updated contact method
            updatedContactMethods.push({ type: corresponding._id, value: item.value });
          }
        }
      });
      Contactables.update({ _id: contactable._id }, { $set: { contactMethods: updatedContactMethods } } );
    });

    return res;
  }
});