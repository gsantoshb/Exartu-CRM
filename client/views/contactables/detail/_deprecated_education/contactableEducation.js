Template.contactableEducation.waitOn = ['ObjTypesHandler', 'ContactableHandler', 'GoogleMaps', 'ContactMethodsHandler'];
Template.contactableEducation.viewModel = function () {
    var self={},
        contactableId=Session.get('entityId');

    self.contactable=ko.meteor.findOne(Contactables,{_id:contactableId});


    return self;
}