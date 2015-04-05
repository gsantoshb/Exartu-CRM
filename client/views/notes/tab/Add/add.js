var entityId, callback;
var isEditing = new ReactiveVar(false), links, typeDep, linkedDep;

Template.noteAdd.created = function () {
    var self = this;

    var initialLink = {
        id: Session.get('entityId'),
        type: Utils.getEntityTypeFromRouter()
    };

    links = self.data.value || [initialLink];
    typeDep = new Tracker.Dependency();
    linkedDep = new Tracker.Dependency();

    Meteor.subscribe('allContactables');
    Meteor.subscribe('allJobs');
    Meteor.subscribe('allPlacements');

};



Template.noteAdd.helpers({
    links: function () {
        linkedDep.depend();
        return links;
    },
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
    getEntity: Utils.getEntityFromLinkForAdd,
    isEditing: function () {
        return isEditing.get();
    }
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

        if (_.findWhere(links, {id: link.id})) return;

        links.push(link);
        linkedDep.changed();
    },
    'click .remove-link': function () {
        //Template.currentData().links = _.without(links, this);
        var link = this;
        var newLinks;
        _.each(links, function(l) {
            if(l.id == link._id) {
                newLinks = links.filter(function(element) {
                    return element.id != l.id
                });
            } else {
                return;
            }
        });
        links = newLinks;
        linkedDep.changed();
    },
    'click #editLinks': function () {
        isEditing.set(true);
    },
    'click #editLinksDone': function () {
        isEditing.set(false);
    }
});