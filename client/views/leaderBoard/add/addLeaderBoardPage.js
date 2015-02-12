LeaderBoardAddController = RouteController.extend({
    waitOn: function () {
        return [Meteor.subscribe('allEmployees')];
    },
    data: function () {
        Session.set('objType', this.params.objType);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        this.render('addLeaderBoardPage');
    },
    onAfterAction: function () {
        var title = 'Add ' + Session.get('objType');
        var description = '';

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

var model;
var options;

var sending = new ReactiveVar(false);

var createLeaderBoard = function (objTypeName) {
    options = Session.get('addOptions');

    if (options) {
        Session.set('addOptions', undefined);
    }
    model = new dType.objTypeInstance(Session.get('objType'), options);
    return model
};

Template.addLeaderBoardPage.helpers({

    model: function () {
        if (!model) {
            model = createLeaderBoard(Session.get('objType'));
        }
        return model;
    },
    objTypeName: function () {
        return Session.get('objType');
    },

    isSelected: function (id) {
        return employeeId == id;
    },
    disableButton: function () {
        return sending.get();
    }
});

Template.addLeaderBoardPage.events({
    'click .btn-success': function () {
        if (!dType.isValid(model)) {
            dType.displayAllMessages(model);
            return;
        }
        var obj = dType.buildAddModel(model);
        obj.members = [];

        sending.set(true);
        Meteor.call('addLeaderBoard', obj, function (err, result) {
            sending.set(false);
            if (err) {
                console.dir(err)
            }
            else {
                Router.go('/leaderBoard/' + result);
            }
        });
    },
    'click .goBack': function () {
        history.back();
    }
});

Template.addLeaderBoardPage.destroyed = function () {
    model = undefined;
};