Migrations.add({
  version: 9,
  up: function () {
    // Regex used to verify phone number format
    var r = /\+1(\d{10})/g;

    // Get all contactMethod types which have phone number as system type
    var contactMethodTypeIds = ContactMethods.find({type: Enums.contactMethodTypes.phone}).map(function (type) { return type._id});

    // Get all contactables with phone numbers
    var contactables = Contactables.find({'contactMethods.type': {$in: contactMethodTypeIds}}).fetch();

    // For each contactable get only its phone numbers
    _.forEach(contactables, function (contactable) {
      _.forEach(contactable.contactMethods, function (contactMethod) {
        if (contactMethodTypeIds.indexOf(contactMethod.type) != -1) {
          var value = contactMethod.value;

          // For each number check if it has the correct format, if not fix it
          if (! r.test(value)) {
            var newValue = value.replace(/( |\(|\)|-)/g, '');

            // After deleting no digits characters check if it has 10 digiits,
            if (newValue.length == 10)
              newValue = '+1' + newValue;

            console.log('phone number formatted:   ' + value + ' --> ' + newValue, contactable._id);
            Contactables.update({_id: contactable._id, 'contactMethods': contactMethod}, {$set: {'contactMethods.$.value': newValue}});
          }
        }
      })
    });
  }
});