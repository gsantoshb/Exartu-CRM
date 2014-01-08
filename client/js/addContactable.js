Template.addContactableModal.events({
	'click #addContactable' : function(event, template) {
		Contactables.insert({
			firstName: $('#first-name').val(),
			lastName: $('#last-name').val(),
			statusNote: $('#status-note').val(),
		});
		$('#addContactableModal').modal('hide');
    }
});