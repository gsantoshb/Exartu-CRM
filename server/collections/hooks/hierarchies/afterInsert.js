
Hierarchies.after.insert(function (userId, doc) {
  if (!doc.parent) {
    if (doc._id != ExartuConfig.TenantId) {
      seedSystemLookUps(doc._id);
      seedEmailTemplates(doc._id);
      seedHotLists(doc._id);
      createHouseAccount(doc);
    }
  }
});
