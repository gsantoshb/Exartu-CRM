ContactablesController = RouteController.extend({
	template: 'contactables',
	layoutTemplate: 'mainLayout',
});

var contactablesHandle = Meteor.subscribe('contactables');

Template.contactables.entities = function(){
	return Contactables.find();
};

Template.contactables.loading = function() {
	return !contactablesHandle.ready();
};