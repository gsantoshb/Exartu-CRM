seedSystemLookUps = function (hierId) {
  if (!hierId) hierId = Meteor.user().hierId;
  _.forEach(systemLookUps, function (item) {
    item.hierId = hierId;
    LookUps.insert(item);
  });
};
