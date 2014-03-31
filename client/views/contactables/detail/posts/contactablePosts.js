Template.contactablePosts.waitOn = ['ObjTypesHandler', 'ContactableHandler', 'GoogleMaps', 'ContactMethodsHandler'];
Template.contactablePosts.viewModel = function () {
    var self= {},
        contactableId= Session.get('entityId');

    self.contactable= ko.meteor.findOne(Contactables, {
        _id: contactableId
    });

    // <editor-fold desc="****** POSTS  ******">
    self.newPost = ko.observable("");

    self.adding = ko.observable(false);
    self.addPost = function () {
        self.adding(true);
        Meteor.call('addContactablePost', contactableId, {
            content: self.newPost()
        }, function (err, result) {
            if (!err) {
                self.adding(false);
                self.newPost("");
            }
        });
    }
    // </editor-fold>

    return self;
}