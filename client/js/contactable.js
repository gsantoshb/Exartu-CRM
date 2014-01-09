ContactableController = RouteController.extend({
	template: 'activities',
	layoutTemplate: 'contactableLayout',
	yieldTemplates: {
		'contactableNavegation': {
			to: 'navegation'
		},
		//		'activities': {
		//			to: 'main'
		//		},
	},
	data: function () {
		return Contactables.findOne({
			_id: this.params._id
		});
	},
	//	after: function () {
	//		this.render('test', {
	//			to: 'main'
	//		});
	//	}
});


ContactableMessageController = RouteController.extend({
	template: 'test',
	layoutTemplate: 'contactableLayout',
	yieldTemplates: {
		'contactableNavegation': {
			to: 'navegation'
		},
	}
	//	yieldTemplates: {
	//		'contactableNavegation': {
	//			to: 'navegation'
	//		},
	//	},
});