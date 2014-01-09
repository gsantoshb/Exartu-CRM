ContactableController = RouteController.extend({
	layoutTemplate: 'contactableLayout',
	action: function () {
		// define which template to render in function of the url's hash
		switch (this.params.hash) {
		case 'messages':
			this.render('test');
			break;
		case 'activities':
			this.render('activities');
			break;
		case undefined:
			this.render('activities');
			break;
		};

		// render contactableNavegation template on navegation regin defined on contactableLayout (client/layouts.html)
		this.render('contactableNavegation', {
			to: 'navegation'
		});
	},
	data: function () {
		Session.set('contactableId', this.params._id); // save current contactable to later use on templates
	},
});

Template.contactableNavegation.contactable = function () { // load contactable information
	return Contactables.findOne({
		_id: Session.get('contactableId')
	});
};