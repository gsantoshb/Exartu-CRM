Template.addContactableModal.events({
	'click #addContactable' : function(event, template) {
		Meteor.call('addContactable', {
			firstName: $('#first-name').val(),
			lastName: $('#last-name').val(),
			statusNote: $('#status-note').val(),
		});
		$('#addContactableModal').modal('hide');
    }
});

Meteor.methods({
	addContactable: function(contactable) {
		Contactables.insert(contactable);
	}
});