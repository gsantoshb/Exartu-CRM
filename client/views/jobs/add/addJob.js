JobAddController = RouteController.extend({
    waitOn: function () {
        return Meteor.subscribe('lookUps');
    },
    data: function () {
        Session.set('objType', this.params.objType);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }

        this.render('addJobPage');
    },
    onAfterAction: function () {
        var title = 'Add Job',
            description = '';
        SEO.set({
            title: title,
            meta: {
                'description': description
            },
            og: {
                'title': title,
                'description': description
            }
        });
    }
});

var addDisabled = new ReactiveVar(false);
var model;
var subTypesDep = new Deps.Dependency;
var createJob = function (objTypeName) {
    addDisabled.set(false);
    var options = Session.get('addOptions');
    if (!options) options={};
    var defaultJobTitle = LookUps.findOne({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode, isDefault: true});
    if (defaultJobTitle) {
        options.jobTitle=defaultJobTitle._id;
        options.publicJobTitle=defaultJobTitle.displayName;
    }
    var defaultStatus = LookUps.findOne({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode, isDefault: true});
    if (defaultStatus)     options.status=defaultStatus._id;
    Session.set('addOptions', undefined);
    model = new dType.objTypeInstance(Session.get('objType'), options);
    globalmodel={model:model,defaultStatus:defaultStatus};

    return model
};

Template.addJobPage.helpers({
    addDisabled: function () {
        return addDisabled.get();
    },
    model: function () {
        if (!model) {
            model = createJob(Session.get('objType'));
        }
        return model;
    },
    subTypeArray: function () {
        subTypesDep.depend();
        return model.subTypes;
    },
    objTypeName: function () {
        return Session.get('objType');
    }
});

Template.addJobPage.events({
    'click .btn-success': function () {
        if (!dType.isValid(model)) {
            dType.displayAllMessages(model);
            return;
        }
        var obj = dType.buildAddModel(model);
        addDisabled.set(true);
        Meteor.call('addJob', obj, function (err, result) {
            if (err) {
                console.dir(err)
            }
            else {
                Meteor.call('setLastClientUsed', obj.client, function () {
                    if (err)
                        console.dir(err);
                });
                addDisabled.set(false);
                Router.go('/job/' + result);
            }
        });
    },
    'click .goBack': function () {
        history.back();
    }
});

Template.addJobPage.destroyed = function () {
    model = undefined;
};