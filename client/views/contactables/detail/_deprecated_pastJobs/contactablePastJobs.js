Template.contactablePastJobs.waitOn = ['ContactableHandler', 'GoogleMaps', 'ContactMethodsHandler'];
Template.contactablePastJobs.viewModel = function () {
    var self={},
        contactableId=Session.get('entityId');

    self.contactable=ko.meteor.findOne(Contactables,{_id:contactableId});


    return self;
}