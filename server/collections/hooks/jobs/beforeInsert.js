Jobs.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  } catch (e) {
    var user = {}
  }

  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();
  if (!doc.activeStatus) doc.activeStatus = LookUpManager.getActiveStatusDefaultId();
  setComputedDisplayFields(doc);
  if (!doc.tags) doc.tags = [];
});


// Helper Functions
var setComputedDisplayFields = function (doc) {
  if (doc.client) {
    var c = Contactables.findOne(doc.client);
    if (c) doc.clientDisplayName = c.displayName;
  }
  if (doc.jobTitle) {
    var jt = LookUps.findOne(doc.jobTitle);
    if (jt) doc.jobTitleDisplayName = jt.displayName;
  }
  doc.displayName = doc.jobTitleDisplayName + ' @ ' + doc.clientDisplayName;
  return doc;
};
