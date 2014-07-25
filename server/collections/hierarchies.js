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

      // List of default values for each lookup type
      hier.defaultLookUpValues = [];

      hier.configuration={
        webName: hier.name,
        title: hier.name,
      }
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
		},
    setLookUpDefault: function(lookUpCode, valueId) {
      var lookUpValue = LookUps.findOne({codeType: lookUpCode, _id: valueId});

      if (!lookUpValue)
        throw new Meteor.Error(500, 'There is no value with id ' + valueId + ' for lookup with code value: ' + lookUpCode);

      // Remove old default value for this lookup type
      LookUps.update({ isDefault: true,  codeType: lookUpCode},
        {
          $set: {
            isDefault: false
          }
        },{ multi: true }
      );

      // Add the new default value
      LookUps.update({_id: valueId},
        {
          $set: {
            isDefault: true
          }
        }
      );
    },
    saveConfiguration: function(options){
      var user= Meteor.user();
      if (!user)
        return null
      if (Hierarchies.findOne({'configuration.webName': options.webName, _id: { $ne: user.hierId } })){
        throw new Meteor.Error(500, 'webName already exists');
      }
      Hierarchies.update({_id: user.hierId}, {$set: {configuration: options}})
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
Hierarchies.after.insert(function(userId, doc){
  seedSystemLookUps(doc._id);
})