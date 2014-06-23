var allow = {
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; },
};

Documents.allow(allow);
Meteor.publish('doccenter_documents', function(){
  return Documents.find();
});

Revisions.allow(allow);
Meteor.publish('doccenter_revisions', function(){
  return Revisions.find();
});

Pages.allow(allow);
Meteor.publish('doccenter_pages', function(){
  return PageImages.find();
});


Fields.allow(allow);
Meteor.publish('doccenter_fields', function(){
  return PageImages.find();
});

RevisionInstances.allow(allow);
Meteor.publish('doccenter_revisionInstances', function(){
  return RevisionInstances.find();
});

PageImages.allow(allow);
Meteor.publish('doccenter_pageImages', function(){
  return PageImages.find();
});

FieldValues.allow(allow);
Meteor.publish('doccenter_fieldValues', function(){
  return PageImages.find();
});
