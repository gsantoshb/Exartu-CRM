Meteor.publish('hierarchies', function() {
  var user = Meteor.users.findOne({_id: this.userId});

  if(!user)
    return false;

  return Hierarchies.find({_id: user.hierId});
});

Meteor.startup(function () {
	Meteor.methods({
		createHier: function (hier) {
			//TODO: Check options values

			if (hier.parent != null) {
				//console.log('New hier with parent');
				var parentHier = Hierarchies.findOne({
					_id: hier.parent
				});
				if (parentHier == null)
					throw new Meteor.Error(404, "Parent hierarchy does not exist");

				hier._id = generateUniqueHierId(hier.parent);

			} else {
				//console.log('New hier without parent');
				hier._id = generateUniqueHierId(ExartuConfig.SystemHierarchyId);
			}

      hier.planCode = 0;

			Hierarchies.insert(hier);

			return hier._id;
		},
		getHierUsers: function () {
			return Meteor.users.find({
				hierId: Meteor.user().hierId
			}).fetch();
		},
		/*
		 *  ---- Testing
		 *
		 */
		testHierSystem: function () {
			// Test: Create a child hier
			var parentId = Meteor.call('createHier', {
				name: 'parent',
			});
			//console.log(parentId);
			var childId = Meteor.call('createHier', {
				name: 'child',
				parent: parentId
			});
			//console.log(childId);


			//console.log('Relation test')

			if (methods.getHierarchiesRelation(parentId, childId) == 1)
				console.log('Relation 1: OK');
			else
				console.log('Relation 1: FAIL');

			if (methods.getHierarchiesRelation(childId, parentId) == -1)
				console.log('Relation 2: OK');
			else
				console.log('Relation 2: FAIL');

			if (methods.getHierarchiesRelation(parentId, parentId) == -1)
				console.log('Relation 3: OK');
			else
				console.log('Relation 3: FAIL');
		},
		testAddUserToHier: function (name, email, pass, hierId) {
			var asd = Meteor.call('addHierUser', hierId, {
				name: name,
				email: email,
				password: pass
			});
		}
	});
});

var generateUniqueHierId = function (prefix) {
	var suffixId = (1 + Math.random()).toString(36).substr(2, 3);
	//console.log(prefix);
	var candidate = prefix != undefined ? prefix + '-' + suffixId : suffixId;

	if (Hierarchies.findOne({
		_id: candidate
	}) == null) {
		return candidate;
	} else {
		generateUniqueHierId(prefix);
	}
};