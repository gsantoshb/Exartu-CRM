HierarchiesManagementController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        return [HierarchiesHandler];
    },
    data: function () {

    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable')
            return;
        }
        this.render('hierarchiesManagement')
    },
    onAfterAction: function () {

    }
});


var selectedHier = null;
var selectedHierDep = new Deps.Dependency;
var sortobj = {sort: {name: 1}}
// A simple schema for editing the hierarchy
var hierarchySchema = new SimpleSchema({
    name: {
        type: String,
        regEx: /.+/
    }
});
AutoForm.hooks({
    hierarchyEdit: {
        onSubmit: function (insertDoc, updateDoc, currentDoc) {
            var self = this;
            Hierarchies.update({_id: selectedHier._id}, updateDoc, function (err, res) {
                self.done();
            });

            return false;
        }
    }
});

Template.hierarchiesManagement.created = function () {
    selectedHier = Hierarchies.findOne(Meteor.user() && Meteor.user().currentHierId);
    selectedHierDep.changed();


};
var query = new Utils.ObjectDefinition({
    reactiveProps: {
        searchString: {}
    }
});
Template.hierarchiesManagement.filters = function () {
    return query;
};

Template.hierarchiesManagement.helpers({
    isAdmin: function () {
        return Utils.adminSettings.isAdmin();
    },
    hierarchies: function () {
        var queryObj = query.getObject();
        var q = {};
        if (queryObj.searchString) {
            q.name =
            {
                $regex: queryObj.searchString,
                $options: 'i'
            };
        }
        ;
        q._id = {$in: Meteor.user().hierarchies};
        //q.inactive= {$not: true};
        return Hierarchies.find(q, sortobj);
    },
    selected: function () {
        selectedHierDep.depend();
        return selectedHier;
    },
    hierarchySchema: function () {
        return hierarchySchema;
    },
    isCurrent: function () {
        return Meteor.user().currentHierId == this._id;
    },
    isInactive: function () {
        return this && this.inactive;
    }
});
Template.hierarchiesManagement.events({
    'click .hierarchyItem': function (e) {


        if (selectedHier == this)
            selectedHier = null;
        else
            selectedHier = this;

        selectedHierDep.changed();
        e.stopPropagation();
    },
    'click #addHier': function () {
        if (!selectedHier) return;
        Utils.showModal('hierarchyAdd', selectedHier._id);
    },
    'click .changeCurrent': function () {
        if (!selectedHier) return;
        if (this && this.inactive) return;

        Meteor.call('changeCurrentHierId', selectedHier._id, function (err, result) {
            if (err)
                console.error(err);
            else {
                Meteor.disconnect();
                Meteor.reconnect();
            }
        })
    }

});

var getChildrenQuery = function (hierId) {
    return {
        _id: {
            $regex: '^' + hierId + '-(\\w)*$'
        }
    };
};

Template.recursiveHierarchies.helpers({
    childHiers: function () {
        return Hierarchies.find(getChildrenQuery(this._id), sortobj);
    },
    isCurrent: function () {
        return Meteor.user().currentHierId == this._id;
    },
    isSelectedClass: function () {
        selectedHierDep.depend();
        return ( this._id == (selectedHier && selectedHier._id ) ) ? 'active' : '';
    },
    hasChilds: function () {
        return Hierarchies.find(getChildrenQuery(this._id)).count() > 0;
    },
    isInactive: function() {
        return this.inactive;
    }
});

Template.recursiveHierarchies.events({
    'click .makeCurrent': function(e)
    {
        if (this && this.inactive) return;

        Meteor.call('changeCurrentHierId', this._id, function (err, result) {
            if (err)
                console.error(err);
            else {
                Meteor.disconnect();
                Meteor.reconnect();
            }
        })
    }
})
