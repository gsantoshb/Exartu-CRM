var entityId = new ReactiveVar(),
  callback,
  selectedType = new ReactiveVar();

Template.noteAdd.created = function () {
    var self = this;

    callback = this.data[0];

    //typeDep = new Tracker.Dependency;

    //Meteor.subscribe('allContactables');
    //Meteor.subscribe('allJobs');
    //Meteor.subscribe('allPlacements');
};



Template.noteAdd.helpers({
    types: function () {
        return _.map(_.filter(_.keys(Enums.linkTypes), function (key) {
            return !_.contains(['deal', 'candidate'], key);
        }), function (key) {
            return Enums.linkTypes[key];
        });
    },
    getEntity: Utils.getEntityFromLinkForAdd,
    showSelect: function () {
      return _.isNumber(selectedType.get())
    },
    getEntities: function () {
        return function (searchString) {
            var self = this;
            switch (selectedType.get()) {
                case Enums.linkTypes.contactable.value:
                    Meteor.call('findContact', searchString, function (err, result) {
                        if (err) {
                            return console.log(err);
                        }
                        self.ready(_.map(result, function (contactable) {
                            Utils.extendContactableDisplayName(contactable);
                            return {
                                id: contactable._id,
                                text: contactable.displayName
                            }
                        }))
                    });
                    break;
                case Enums.linkTypes.job.value:
                    Meteor.call('findJob', searchString, function (err, result) {
                        if (err){
                            return console.log(err);
                        }
                        self.ready(_.map(result, function (job) {
                            return  {
                                id: job._id,
                                text: job.publicJobTitle
                            }
                        }))
                    });
                    break;
                case Enums.linkTypes.placement.value:
                    Meteor.call('findPlacement', searchString, function (err, result) {
                        if (err){
                            return console.log(err);
                        }
                        self.ready(_.map(result, function (placement) {
                            return  {
                                id: placement._id,
                                text: placement.displayName
                            }
                        }))
                    });
                    break;
                default :
                    return [];
            }
        }
    },
    onChange: function () {
        return function (value) {
            entityId.set(value);
        }
    }
});

Template.noteAdd.events({
    'change #noteTypeSelect': function (e) {
        selectedType.set(parseInt(e.target.value));
    },
    'click #noteLinkEntity': function () {
        var type = selectedType.get();
        var entity = entityId.get();
        if (!_.isNumber(type) || !entity) return;

        var link = {
            type: type,
            id: entity
        };

        callback(link);
    }
});