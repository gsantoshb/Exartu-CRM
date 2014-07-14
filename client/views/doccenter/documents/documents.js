DocCenter.DocCenterController = RouteController.extend({
  template: 'docCenterDocuments',
  waitOn: function () {
    return [dType.ObjTypesHandler]
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable')
      return;
    }
    this.render('docCenterDocuments')
  }
});

//var contactableId = 'o8AhGRQdPv6f5BuJZ';

Template.docCenterDocumentList.documents = function() {
  return DocCenter.getDocuments();
};

//Template.docCenterDocumentList.entityDocumentInstances = function() {
//  return DocCenter.getEntityRevisionInstances(contactableId);
//};
//
//Template.docCenterDocumentsListSearch.searchString = function() {
//  return 'search';
//};

//Template.docCenterDocumentList.events = {
//  'click #send': function() {
//    var currentDocumentRevision = this.getCurrentRevision();
//    var revInstance = new DocCenter.RevisionInstance({entityId: contactableId}, currentDocumentRevision);
//  }
//};