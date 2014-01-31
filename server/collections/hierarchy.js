createHier = function (name, parent) {
    return Meteor.call('createHier', {
        name: name,
        parent: parent
    });
}
Meteor.startup(function () {
    Meteor.methods({
        createHier: function (options) {
            //TODO: Check options values

            if (options.parent != null) {
                var parentHier = Hierarchies.findOne({
                    _id: options.parent
                }).fetch();
                if (parentHier == null)
                    throw new Meteor.Error(404, "Parent hierarchy does not exist");
            }

            return Hierarchies.insert({
                name: options.name,
                parent: options.parent
            });
        }
    });
});