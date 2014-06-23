DocCenter = DocCenter || {};

Documents = new Meteor.Collection('doccenter_documents', {
  transform: function(document) {
    return new DocCenter.Document({fromTransform: document});
  }         
});
Revisions = new Meteor.Collection('doccenter_revisions', {
  transform: function(revision) {
    return new DocCenter.Revision(revision);
  }         
});
Pages = new Meteor.Collection('doccenter_pages', {
  transform: function(page) {
    return new DocCenter.Page({fromTransform: page});
  }         
});
PageImages = new Meteor.Collection('doccenter_pageImages');
Fields = new Meteor.Collection('doccenter_fields', {
  transform: function(field) {
    return new DocCenter.Field({fromTransform: field});
  }         
});
RevisionInstances = new Meteor.Collection('doccenter_revisionInstances', {
  transform: function(revision) {
    return new DocCenter.RevisionInstance(revision);
  }         
});
PageInstances = new Meteor.Collection('doccenter_pageInstances', {
  transform: function(pageInstance) {
    return new DocCenter.PageInstance(pageInstance);
  }         
});
FieldValues = new Meteor.Collection('doccenter_fieldValues', {
  transform: function(fieldValue) {
    return new DocCenter.FieldValue(fieldValue);
  }         
});

// Setup
(function(){
  // Load plugin
  // ...

})();

// DocCenter
DocCenter.getDocuments = function() {
  return Documents.find();
};
DocCenter.getEntityDocuments = function(entityId) {
  return Documents.find({entityId: entityId});
};
DocCenter.getDocument = function(documentId) {
  return Documents.findOne({_id: documentId});
};

// Document
DocCenter.Document = function(options) {
  if (options.fromTransform) {
    _.extend(this, options.fromTransform);
    return;
  }
  
  this.name = options.name;
  this.description = options.description;
  
  var firstRevision = new DocCenter.Revision();
  this.addRevision(firstRevision);
  this.setCurrentRevision(firstRevision._id);
  
  if (options.imageId) {
    // Separate pdf by page.
    // Add a new page to the first revision to each pdf page.
  }
  
  this.hierId = Meteor.user().hierId;
  this._id = Documents.insert(this);
};

DocCenter.Document.prototype.addRevision = function(revision) {
  if (!(revision instanceof DocCenter.Revision))
    throw new Meteor.Error(500, 'revision should be a instance of DocCenter.Revision');
  
  this.revisions.push(revision._id);
  revision.documentId = this._id;
  Documents.update({_id: this._id}, {$addToSet: {revisions: revision._id}});
  Revisions.update({_id: revision._id}, {$set: {documentId: this._id}});
};
DocCenter.Document.prototype.getRevisions = function() {
  return Revisions.find({_id: {$in: this.revisions}});
};
DocCenter.Document.prototype.getRevision = function(revisionId) {
  return Revisions.findOne({_id: revisionId});
};
DocCenter.Document.prototype.getCurrentRevision = function() {
  return Revisions.findOne({_id: this.currentRevisionId});
};
DocCenter.Document.prototype.setCurrentRevision = function(revisionId) {
  if (!Revisions.findOne({_id: revisionId}))
    throw new Meteor.Error(500, 'Revision not found');
  
  this.currentRevisionId = revisionId;
  Documents.update({_id: this._id}, {$set: {currentRevisionId: revisionId}});
};

// Revision
DocCenter.Revision = function(data) {
  if (data) {
    _.extend(this, data);
    return;
  };
  
  this.pages = [];
  this.addPage(new DocCenter.Page());

  this.hierId = Meteor.user().hierId;
  this._id = Revisions.insert(this);
}; 

// Revision - Page
DocCenter.Revision.prototype.addPage = function(page) {
  this.pages = [page._id];
  Revision.update({_id: this._id},  {$addToSet: {pages: page._id}});
};
DocCenter.Revision.prototype.getPages = function() {
  return Pages.find({_id: {$in: this.pages}});
};
DocCenter.Revision.prototype.getPage = function(pageNumber) {};
DocCenter.Revision.prototype.removePage = function(pageNumber) {};

// Revision - Instance
DocCenter.Revision.prototype.addInstance = function(revisionInstance) {};
DocCenter.Revision.prototype.getInstances = function() {};
DocCenter.Revision.prototype.getInstance = function(instanceId) {};

// Page
DocCenter.Page = function(options) {
  if (options && options.fromTransform) {
    _.extend(this, options.fromTransform);
    return;
  }
  
  this.fields = [];
  this.image = options? options.pageImageId : undefined;
  
  Pages.insert(this);
};

DocCenter.Page.prototype.addField = function(field) {
  this.fields.push(field._id);
  Pages.update({_id: this._id}, {$addToSet: {fields: field._id}});
};

// Fields
DocCenter.Field = function(options) {
  if (options.fromTransform) {
    _.extend(this, options.fromTransform);
    return;
  }
  
  this.type = 1;
  
  this._id = Fields.insert(this);
};

// Revision Instance
//  A revision instances has the values for the fields defined in the orignal revision.
//
// Parameters:
//  options
//    - entityId:   Entity id
DocCenter.RevisionInstance = function(options, revision) {
  if (options.fromTransform) {
    _.extend(this, options.fromTransform);
    return;
  }
  
  if (!revision || !(revision instanceof DocCenter.Revision))
    throw new Meteor.Error(500, 'Revision required to create an instance');
  
  this.entityId = options.entityId;
  this.pageInstances = [];
  
  _.forEach(revision.pages, function(page) {
    this.addPageInstance(new DocCenter.PageInstance(page));
  });
  
  RevisionInstances.insert(this);
};

DocCenter.RevisionInstance.addPageInstance = function(pageInstance) {
  this.pageInstances.push(pageInstance._id);
  RevisionInstances.update({_id: this._id}, {$addToSet: {pageInstances: pageInstance._id}});
};

// PageInstance
DocCenter.PageInstance = function(options, page) {
  if (options.fromTransform) {
    _.extend(this, options.fromTransform);
    return;
  }
  
  this.pageId = page._id;
  this.values = [];
  
  _.forEach(page.fields, function(field) {
    this.values.push({
      fieldId: field,
      value: undefined
    });
  });
  
  PageInstances.insert(this);
};

// FieldValue
DocCenter.FieldValue = function(field) {
  this.fieldId = field._id;
  this.value = undefined;
  
  this._id = FieldValues.insert(this);
};

// PENDING.....

// Dependency
DocCenter.Dependency = function(options) {};

// TESTING

DocCenter.test = function() {
  var doc = new DocCenter.Document({name: 'doc1'});
  var rev = new DocCenter.Revision();
  
  doc.addRevision(rev);
  doc.setCurrentRevision(rev._id);
  
  var currentRev = doc.getCurrentRevision();
  console.dir(currentRev);
    
  
    
};