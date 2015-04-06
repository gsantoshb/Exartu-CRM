var pageLimit = 10;

var entityType = null;
var isEntitySpecific = false;

var membersCollection = Contactables;
var hotListCollection = HotLists;
var HotListMembersHandler, query;

// Vars
var searchFields = ['person.firstName', 'person.lastName', 'person.middleName', 'organization.organizationName'];
var defaultSort = {
    'displayName': -1
};

var options = {};
var searchQuery = {};

var hotList;
var isSearching = false;

// Reactive vars
//var hotListMembers = new ReactiveVar();
var membersCount = new ReactiveVar();
var members = new ReactiveVar();

// Dependencies
searchDep = new Tracker.Dependency;
var hotListMembersDep = new Deps.Dependency();


var loadqueryFromURL = function (params) {
    // Search string
    var searchStringQuery = {};
    if (params.search) {
        searchStringQuery.default = params.search;
    }

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery
        }
    });
}


var setSubscription = function (searchQuery, options) {

    hotList.members = members.get();
    searchQuery = {_id: { $in : members.get() } };
    if (SubscriptionHandlers.HotListMembersHandler) {
        SubscriptionHandlers.HotListMembersHandler.setFilter(searchQuery);
        SubscriptionHandlers.HotListMembersHandler.setOptions(options);
    }
    else {
        SubscriptionHandlers.HotListMembersHandler =
            Meteor.paginatedSubscribe('hotListMembers', {
                pubArguments: hotList._id,
                filter: searchQuery,
                options: options
            });
    }

    HotListMembersHandler = SubscriptionHandlers.HotListMembersHandler;

    //membersCount.set( HotListMembersHandler.totalCount() );
    var skip = (HotListMembersHandler.currentPage()-1)*pageLimit;

    options.limit = pageLimit;
    options.skip = skip;

    searchDep.depend();
    return;
}


/**
 * HotList Members - Template
 */
Template.hotListMembersBox.created = function () {

    query = query || loadqueryFromURL(Router.current().params.query);

    if(this.data.hotList) hotList = this.data.hotList;
    else hotList = HotLists.findOne({_id: Session.get('entityId')});

    members.set(hotList.members);
    membersCount.set( hotList.members.length );

    searchQuery = {_id: { $in : hotList.members } };
    options.sort = {};
    options.sort = defaultSort;
    options.pubArguments = hotList._id;
    setSubscription(searchQuery, options);
};

Template.hotListMembersBox.destroyed = function(){
    if(SubscriptionHandlers.HotListMembersHandler){
        SubscriptionHandlers.HotListMembersHandler.stop();
        delete SubscriptionHandlers.HotListMembersHandler;
    }
};

Template.hotListMembersBox.helpers({
    isSearching: function () {
        return isSearching;
    }
});


/**
 * HotList Members - Header template
 */
Template.hotListMembersHeader.helpers({
    membersCount: function () {
        return membersCount.get();
    }
});


/**
 * HotList Members - Search template
 */
Template.hotListMembersSearch.helpers({
    searchString: function () {
        return query.searchString;
    },
    isLoading: function () {
        return HotListMembersHandler.isLoading();
    }
});

Template.hotListMembersSearch.events({
    'keyup #searchString': _.debounce(function (e) {
        query.searchString.value = e.target.value;
        setSubscription(searchQuery, options);
    }, 200),

    'click .addHotListMember': function (e, ctx) {
        Utils.showModal(
            'hotListMemberAdd',
            hotList._id, function(memberId, hotListId){
                var tempHotList = HotLists.findOne({_id: Session.get('entityId')});
                var mbrs = tempHotList.members;

                if(tempHotList.members.indexOf(memberId) > -1) {
                    return false;
                }

                mbrs.push(memberId);

                HotLists.update({_id: hotListId}, {$set: {members: mbrs}});

                membersCount.set( mbrs.length );
                members.set( mbrs );

                setSubscription(searchQuery, options);
                searchDep.changed();
                return;
            }
        );
    },

    'click #sendEmailTemplate': function () {
        var hotlist = HotLists.findOne({_id: Session.get('entityId')});
        var contacts = Contactables.find({_id: { $in : hotlist.members } }, {sort: {displayName: 1}}).fetch();
        var selected = [];

        _.forEach(contacts, function (contactable) {
            selected.push({
                id: contactable._id,
                type: contactable.objNameArray,
                email: Utils.getContactableEmail(contactable)
            });
        });

        // get the common type that all selected entities have, ignoring contactable, person and organization
        var commonType = _.without(_.pluck(selected, 'type'), 'contactable', 'person', 'organization');

        if (!commonType || !commonType.length) return;
        commonType = commonType[0];

        //filter from the selection the ones that don't have email
        var filtered = _.filter(selected, function (item) {
            return item.email;
        });

        var context = {
            recipient: _.map(filtered, function (item) {
                return {
                    id: item.id,
                    email: item.email
                };
            })
        };

        context[commonType] = _.pluck(filtered, 'id');
        Utils.showModal('sendEmailTemplateModal', context);
    }
});


/**
 * HotList Members - List section
 */
Template.hotListMembersList.created = function () {

    options = {};
    searchQuery = {};
    query = query || loadqueryFromURL(Router.current().params);

    options.sort = {};
    options.sort = defaultSort;
    options.pubArguments = hotList._id;
    setSubscription(searchQuery, options);

    Tracker.autorun(function () {


        var urlQuery = new URLQuery();
        searchQuery = {
            _id: { $in : hotList.members },
            $and: [] // Push each $or operator here
        };

        options = {};
        options.sort = {};
        options.sort = defaultSort;
        options.pubArguments = hotList._id;

        // String search
        if (query.searchString.value) {
            var stringSearches = [];

            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };
                stringSearches.push(aux);
            });

            searchQuery.$and.push({
                $or: stringSearches
            });

            urlQuery.addParam('search', query.searchString.value);
        }

        // if there are no search conditions
        if (searchQuery.$and.length == 0){
            delete searchQuery.$and;
        }

        urlQuery.apply();
        setSubscription(searchQuery, options);
    });
};

Template.hotListMembersList.helpers({
    isLoading: function () {
        return HotListMembersHandler.isLoading();
    },
    hotListMembers: function () {
        console.log(searchQuery);
        console.log(options);
        console.log('members');
        var members = membersCollection.find(searchQuery, options);
        console.log(members.fetch());
        return members;
    }
});

Template.hotListMembersList.events({
    'click .removeMember': function (e, ctx) {
        var tempHotList = HotLists.findOne({_id: Session.get('entityId')});
        tempHotList.members.splice(tempHotList.members.indexOf(this._id), 1);
        HotLists.update({_id: tempHotList._id}, {$set: {members: tempHotList.members}});

        //HotLists.update({_id: tempHotList._id}, {$pull: { 'members': this._id }});

        membersCount.set( tempHotList.members.length );

        members.set( tempHotList.members );
        setSubscription(searchQuery, options);

        e.preventDefault();
        searchDep.changed();
        return;
    }
});


/**
 * HotList Members - Item template
 */
Template.hotListMembersListItem.helpers({
    getAcronym: function(str) {
        var matches = str.match(/\b(\w)/g);
        return matches.join('');
    }
});