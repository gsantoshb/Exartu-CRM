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
		this.render('contactableNavigation', {
			to: 'navegation'
		});
		this.render('tags', {
			to: 'information'
		});
	},
	data: function () {
		// save current contactable to later use on templates
		Session.set('contactableId', this.params._id);
	},
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
        this.render('contactableNavigation', {
            to: 'navegation'
        });
        this.render('tags', {
            to: 'information'
        });
    },
    data: function () {
        Session.set('contactableId', this.params._id); // save current contactable to later use on templates
    },
});

Template.contactableLayout.rendered = function () {
	var viewModel = function () {
		var self = this;
		self.navigationVM = getNavigationVM();
		self.tagVM = getTagVM();
		self.messageVM = getEntityMessageVM(Session.get('contactableId'));
	}

	ko.applyBindings(new viewModel());
};

var getNavigationVM = function () {
	// load contactable information
	var contactableVM = function () {
		var self = this;
		self.contactable = ko.meteor.findOne(Contactables, {
			_id: Session.get('contactableId')
		});
		self.contactable().displayName = ko.computed(
			function () {
				return self.contactable().firstName() + ', ' + self.contactable().lastName();
			}, self);

		return self;
	};
	return new contactableVM()
};

var getTagVM = function () {
	var viewModel = function () {
		var self = this;
		self.contactable = ko.meteor.findOne(Contactables, {
			_id: Session.get('contactableId')
		});
		self.tags = self.contactable().tags;
        self.newTag = ko.observable('');
        self.isAdding = ko.observable(false);
        self.addTag = function () {
            Contactables.update({
                _id: Session.get('contactableId')
            }, {
                $addToSet: {
                    tags: self.newTag()
                }
            })
        }
		return self;
	};
	return new viewModel();
}