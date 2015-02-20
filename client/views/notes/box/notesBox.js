var entityType = null;
var isEntitySpecific = false;
var NotesHandler, noteQuery, status;
var selectedSort = new ReactiveVar();
$("#userDropdown").prop("selectedIndex", -1);
var loadNoteQueryFromURL = function (params) {
    // Search string
    var searchStringQuery = {};


    if (params.search) {
        searchStringQuery.default = params.search;
    }

    var userIdQuery = {};
    if (params.userId) {
        userIdQuery.default = params.userId;
    }
    // CreationDate
    var creationDateQuery = {};
    if (params.creationDate) {
        creationDateQuery.default = params.creationDate;
    }
    // Owned by me
    var ownedByMeQuery = {type: Utils.ReactivePropertyTypes.boolean};
    ownedByMeQuery.default=false;
    if (params.owned) {
        console.log('paramsowned',params.owned);
        ownedByMeQuery.default = params.owned ? true: false;
    }

    var x = new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery,
            userId: userIdQuery,
            ownedByMe: ownedByMeQuery,
            selectedLimit: creationDateQuery
        }
    });
    return x;
};
var options = {};

var noteCount = new ReactiveVar();

Template.notesBox.created = function () {
    noteQuery = noteQuery || loadNoteQueryFromURL(Router.current().params.query);
    var entityId = Session.get('entityId');

    if (!SubscriptionHandlers.NotesHandler) {
        SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe("notes");
    }
    NotesHandler = SubscriptionHandlers.NotesHandler;

    entityType = Utils.getEntityTypeFromRouter();
    isEntitySpecific = false;
    if (entityType != null) isEntitySpecific = true;

    Meteor.autorun(function () {
        var urlQuery = new URLQuery();
        var queryObj = noteQuery.getObject();
        var q = {};

        if (queryObj.userId) {
            q.userId = queryObj.userId;
            urlQuery.addParam('userId', queryObj.userId);
        }
        if (queryObj.searchString) {
            q.msg = {
                $regex: queryObj.searchString,
                $options: 'i'
            };
            urlQuery.addParam('search', queryObj.searchString);
        }
        if (isEntitySpecific) {
            q.links = {$elemMatch: {id: entityId}};
        }
        if (queryObj.selectedLimit) {
            var dateLimit = new Date();
            q.dateCreated = {
                $gte: dateLimit.getTime() - queryObj.selectedLimit
            };
            urlQuery.addParam('creationDate', queryObj.selectedLimit);
        }
        if (queryObj.ownedByMe) {
            q.userId = Meteor.userId();
            urlQuery.addParam('owned', true);
        }


        urlQuery.apply();
        if (selectedSort.get()) {
            var selected = selectedSort.get();
            options.sort = {};
            options.sort[selected.field] = selected.value;
        } else {
            delete options.sort;
        }
        NotesHandler.setFilter(q);
        NotesHandler.setOptions(options);


    })
};

Template.notesBox.rendered = function () {
    $(document).on('click', 'button[data-toggle="popover"]', function (e) {
        var object = e.currentTarget;
        var linkId = $(object).attr('data-link');
        if ($(object).attr('data-init') == 'off') {
            $(object).attr('data-content', $('#' + linkId).html());
            $(object).popover('show');
            $(object).attr('data-init', 'on');
        }
    });
};

Template.notesBox.helpers({
    noteCount: function () {
        return NotesHandler.totalCount();
    },
    users: function () {
        return Meteor.users.find({}, {sort: {'emails.address': 1}});
    },
    notes: function () {
        return Notes.find();
    },
    filters: function () {
        return noteQuery;
    },
    selectedClass: function () {
        statusDep.depend();
        return this == status ? 'btn-primary' : 'btn-default';
    },
    isLoading: function () {
        return NotesHandler.isLoading();
    }
});

Template.notesBox.events({
    'keyup #searchString': _.debounce(function (e) {
        noteQuery.searchString.value = e.target.value;
    }, 200),
    'click .addNote': function () {
        if (!isEntitySpecific)
            Utils.showModal('addEditNote');
        else
            Utils.showModal('addEditNote', {
                links: [{
                    id: Session.get('entityId'),
                    type: entityType
                }]
            })
    }
});
// list sort


selectedSort.field = 'dateCreated';
selectedSort.value = -1;
var sortFields = [
    {field: 'dateCreated', displayName: 'Date'},
];

Template.noteListSort.helpers({
    sortFields: function () {
        return sortFields;
    },
    selectedSort: function () {
        return selectedSort.get();
    },
    isFieldSelected: function (field) {
        return selectedSort.get() && selectedSort.get().field == field.field;
    },
    isAscSort: function () {
        return selectedSort.get() ? selectedSort.get().value == 1 : false;
    }
});

var setSortField = function (field) {
    var selected = selectedSort.get();
    if (selected && selected.field == field.field) {
        if (selected.value == 1)
            selected = undefined;
        else
            selected.value = 1;
    } else {
        selected = field;
        selected.value = -1;
    }
    selectedSort.set(selected);
};

Template.noteListSort.events = {
    'click .sort-field': function () {
        setSortField(this);
    }
};

