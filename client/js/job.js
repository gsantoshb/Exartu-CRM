JobController = RouteController.extend({
    layoutTemplate: 'job',
    action: function () {
        // define which template to render in function of the url's hash
        //        switch (this.params.hash) {
        //        case 'details':
        //            this.render('contactableDetails', {
        //                to: 'content'
        //            });
        //            break;
        //        case 'details':
        //            this.render('contactableDetails', {
        //                to: 'content'
        //            });
        //            break;
        //        case 'posts':
        //            this.render('contactablePosts', {
        //                to: 'content'
        //            });
        //            break;
        //        default:
        //            this.render('contactableHome', {
        //                to: 'content'
        //            });
        //            break;
        //        };
    },
    data: function () {
        Session.set('entityId', this.params._id); // save current contactable to later use on templates
    }
});

Template.job.rendered = function () {
    // load contactable information
    var vm = function () {
        var self = this,
            jobId = Session.get('entityId');

        self.job = ko.meteor.findOne(Jobs, {
            _id: jobId
        });

        return self;
    };

    helper.applyBindings(vm, 'jobVM', JobHandler);
};