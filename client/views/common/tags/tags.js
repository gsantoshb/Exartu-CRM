Template.tags.viewModel = function () {
    var self = this,
        entityID = Session.get('entityId');

    self.contactable = ko.meteor.findOne(Contactables, {
        _id: entityID
    });

    if (!self.contactable())
        console.log('contactable is undefined');
    if (!self.contactable().tags)
        self.contactable().tags = ko.observableArray([]);
    self.newTag = ko.observable('');
    self.isAdding = ko.observable(false);
    self.addTag = function () {
        if (!self.newTag())
            return;
        self.isAdding(true);
        Meteor.call('addContactableTag', entityID, self.newTag(), function (err, result) {
            if (!err) {
                self.isAdding(false);
                self.newTag('');
            }
        })
    }
    return self;
}