
Contactables.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  } catch (e) {
    var user = {}
  }

  if (doc.Employee && doc.Employee.taxID) {
    if (!ContactableManager.isTaxIdUnused(doc.Employee.taxID, user.hierId || doc.hierId)) {
      throw new Meteor.Error(500, 'TaxId already in use');
    }
  }

  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.createdBy = doc.userId;
  doc.dateCreated = Date.now();
  if (!doc.activeStatus) doc.activeStatus = LookUpManager.getActiveStatusDefaultId();
  if (doc.organization) {
    doc.displayName = doc.organization.organizationName;
  }

  if (doc.person) {
    doc.displayName = doc.person.lastName + ', ' + doc.person.firstName;
  }
});
