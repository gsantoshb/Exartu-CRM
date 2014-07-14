var pdf;

Template.addDocCenterDocument.events = {
  'click .goBack': function() {
    history.back();
  },
  'change #load-pdf': function(e){
    pdf = e.target.files[0];
  },
  'click #add-document': function() {
    var documentName = $('#document-name').val();
    var documentDescription = $('#document-desc').val();

    if (_.isEmpty(documentName))
      return;

    new DocCenter.Document({name: documentName, description: documentDescription, fromPDF: pdf}, function(err, result) {
      if (!err)
        DocCenter.addDocument(result);
        history.back();
    });
  }
}