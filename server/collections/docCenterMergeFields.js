DocCenterMergeFields = new Mongo.Collection('docCenterMergeFields');

Meteor.publish('docCenterMergeFields', function () {
  return DocCenterMergeFields.find();
});