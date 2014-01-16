basicType = {
    string: 0,
}
ObjectType = {
    0: {
        name: 'Employee',
        sysRes: ['Message'],

        validate: function (obj) {
            if (obj.type.indexOf(this._id) < 0)
                return false;
            if (!obj.messages)
                return false;
            if (obj.person & (!validatePerson(obj.person)))
                return false;
            if (obj.organization & (!validateOrganization(obj.person)))
                return false;

        },
        getFields: function () {
            return [{
                name: 'test',
                regex: /.+/,
                type: basicType.string,
                defaultValue: '',
            }];
        },
    }

};

Meteor.startup(function () {
    Meteor.methods({
        getFields: function (id) {
            return ObjectType[id].getFields();
        }
    });
});

//    new Meteor.Collection("contactables");
//
//Meteor.publish('contactables', function () {
//	var user = Meteor.users.findOne({
//		_id: this.userId
//	});
//
//	if (!user)
//		return false;
//
//	return Contactables.find({
//		hierId: user.hierId
//	});
//})

//Meteor.startup(function () {
//	Meteor.methods({
//		addContactable: function (contactable) {
//			var user = Meteor.user();
//			if (user == null)
//				throw new Meteor.Error(401, "Please login");
//
//			addSystemMetadata(contactable, user);
//
//			Contactables.insert(contactable);
//		}
//	});
//});

//Contactables.allow({
//	update: function () {
//		return true;
//	}
//});


//Contactables.before.insert(function (userId, doc) {
//	doc.createdAt = Date.now();
//});