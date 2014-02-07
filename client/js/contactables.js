ContactablesController = RouteController.extend({
	template: 'contactables',
	layoutTemplate: 'mainLayout',
	action: function () {
		if (this.params.hash == undefined || this.params.hash != 'all') {
			var re = new RegExp("^" + this.params.hash + "$", "i");
			var objType = ObjTypes.findOne({
				objName: re
			})
			if (objType != null)
				Session.set('objTypeList', objType);
			else
				this.redirect('/contactables#all');
		} else {
			Session.set('objTypeList', undefined);
		}

		this.render();
	},
});

Template.contactables.rendered = function () {
	var viewModel = function () {
		var self = this;
		self.ready = ko.observable(false);
		self.objTypeSelected = Session.get('objTypeList');

		var entitiesQuery = {};
		if (self.objTypeSelected != undefined)
			entitiesQuery = {
				objNameArray: {
					$in: [self.objTypeSelected.objName]
				}
			}

		self.entities = ko.meteor.find(Contactables, entitiesQuery);

		self.contactableTypes = ko.observableArray();

		Meteor.subscribe('objTypes', function () {
			self.getIconForObjName = function (objname) {
				var type = ObjTypes.findOne({
					objName: objname
				});
				return 'glyphicon ' + type.glyphicon;
			};

			var filter = {
				objGroupType: Enums.objGroupType.contactable
			};
			if (self.objTypeSelected != undefined)
				filter.objName = self.objTypeSelected.objName;

			var result = ObjTypes.find(filter).fetch();

			self.contactableTypes(result);
			_.extend(self, helper.createObjTypefilter(['person.firstName', 'person.lastName', 'organization.organizationName'], result,
				function () {
					self.entities(ko.mapping.fromJS(Contactables.find(this.query).fetch())());
				}));
			self.ready(true);
		});

		self.showAddContactableModal = function (typeId) {
			Session.set('newContactableTypeId', typeId);
			$('#addContactableModal').modal('show');
		};
	};
	helper.applyBindings(viewModel, 'contactablesVM');
};