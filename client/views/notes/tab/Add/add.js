var entityId, callback, typeDep;
//var isEditing = new ReactiveVar(false), links, typeDep, linkedDep;

Template.noteAdd.created = function () {
    var self = this;

    callback = this.data[0];

    typeDep = new Tracker.Dependency;

    Meteor.subscribe('allContactables');
    Meteor.subscribe('allJobs');
    Meteor.subscribe('allPlacements');
};



Template.noteAdd.helpers({
    types: function () {
        return _.map(_.filter(_.keys(Enums.linkTypes), function (key) {
            return !_.contains(['deal', 'candidate'], key);
        }), function (key) {
            return Enums.linkTypes[key];
        });
    },
    entities: function () {
        typeDep.depend();
        var DOM = UI.getView()._domrange;
        if (!DOM)
            return;

        var selectedType = DOM.$('#noteTypeSelect').val();
        selectedType = parseInt(selectedType);
        switch (selectedType) {
            case Enums.linkTypes.contactable.value:
                return AllContactables.find();
            case Enums.linkTypes.job.value:
                return AllJobs.find();
            case Enums.linkTypes.placement.value:
                return AllPlacements.find();
            default :
                return [];
        }
    },
    getEntity: Utils.getEntityFromLinkForAdd
});

var link = function (ctx, link) {

};

Template.noteAdd.events({
    'change #noteTypeSelect': function () {
        typeDep.changed();
    },
    'click #noteLinkEntity': function () {
        var type = UI.getView()._templateInstance.$('#noteTypeSelect').val();
        type = parseInt(type);
        var entity = UI.getView()._templateInstance.$('#noteEntitySelect').val();
        if (!_.isNumber(type) || !entity) return;

        var link = {
            type: type,
            id: entity
        };

        callback(link);
    },
    'click #editLinks': function () {
        isEditing.set(true);
    },
    'click #editLinksDone': function () {
        isEditing.set(false);
    }
});