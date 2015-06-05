var pageLimit = 10;
var membersCollection = Contactables;
var HotListMembersHandler, query;

// Vars
var searchFields = ['person.firstName', 'person.lastName', 'person.middleName', 'organization.organizationName'];
var defaultSort = {
  'displayName': -1
};

var options = {};
var searchQuery = {};

var hotList;

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
};

var setSubscription = function (searchQuery, options) {
  hotList = HotLists.findOne({_id: Session.get('entityId')});
  if(hotList) {
    var members = hotList.members ? hotList.members : [];
    members = _.pluck(members, 'id');
    searchQuery = {_id: {$in: members}};
  }
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

  var skip = (HotListMembersHandler.currentPage() - 1) * pageLimit;

  options.limit = pageLimit;
  options.skip = skip;
};


/**
 * HotList Members - Template
 */
Template.hotListMembersBox.created = function () {
  query = query || loadqueryFromURL(Router.current().params.query);
  options.sort = defaultSort;
  options.pubArguments = Session.get('entityId');
  //setSubscription(searchQuery, options);


  //setSubscription(searchQuery, options);

  Tracker.autorun(function () {
    if(hotList) {
      var urlQuery = new URLQuery();
      searchQuery = {
        _id: {$in: _.pluck(hotList.members || [], 'id')},
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
      if (searchQuery.$and.length == 0) {
        delete searchQuery.$and;
      }

      urlQuery.apply();
      if (SubscriptionHandlers.HotListMembersHandler) // To avoid being called after the template destroy
        setSubscription(searchQuery, options);
    }
  });
};

Template.hotListMembersBox.destroyed = function () {
  if (SubscriptionHandlers.HotListMembersHandler) {
    SubscriptionHandlers.HotListMembersHandler.stop();
    delete SubscriptionHandlers.HotListMembersHandler;
  }
};


/**
 * HotList Members - Header template
 */
Template.hotListMembersHeader.helpers({
  membersCount: function () {
    if(SubscriptionHandlers.HotListMembersHandler)
       return SubscriptionHandlers.HotListMembersHandler.totalCount() || 0;
    else
       return 0
  }
});


/**
 * HotList Members - Search template
 */
Template.hotListMembersSearch.helpers({
  searchString: function () {
    return query.searchString;
  }
});

Template.hotListMembersSearch.events({
  'keyup #searchString': _.debounce(function (e) {
    query.searchString.value = e.target.value;
    setSubscription(searchQuery, options);
  }, 200),

  'click .addHotListMember': function (e, ctx) {
    Utils.showModal('hotListMemberAdd', hotList, function (memberId, hotListId) {
        Meteor.call('addMembersToHotList', hotListId, [memberId], function () {
          setSubscription(searchQuery, options);
        });
      }
    );
  },

  'click #sendEmailTemplate': function () {
    var hotList = HotLists.findOne({_id: Session.get('entityId')});
    //var members = Contactables.find({_id: {$in: hotList.members || []}}, {sort: {displayName: 1}}).fetch();

    // Choose the template to send
    Utils.showModal('sendEmailTemplateModal', {
      categories: [hotList.category],
      callback: function (result) {
        if (result) {
          var recipients = [];
          // Get the email of all the members of the hotlist when available

          //_.each(members, function (member) {
          //  var email = _.find(member.contactMethods, function (cm) {
          //    return _.indexOf(emailCMTypes, cm.type) != -1
          //  });
          //  if (email)
          //    recipients.push({contactableId: member._id, email: email.value});
          //});

          if (result.templateId) {
            // send the email template to the recipients
            Meteor.call('sendEmailTemplate', result, hotList, function (err, result) {
              if (!err) {
                $.gritter.add({
                  title: 'Email template sent',
                  text: 'The email template was successfully sent.',
                  image: '/img/logo.png',
                  sticky: false,
                  time: 2000
                });
              }
            });
          }
          else {
            Meteor.call('sendMultiplesEmail', result, hotList, function (err, result) {
              if (!err) {
                $.gritter.add({
                  title: 'Email template sent',
                  text: 'The email template was successfully sent.',
                  image: '/img/logo.png',
                  sticky: false,
                  time: 2000
                });
              }
              else{

              }
            });
          }
        }
      }
    });
  }
});


/**
 * HotList Members - List section
 */
Template.hotListMembersList.created = function () {


};

Template.hotListMembersList.helpers({
  isLoading: function () {
    return HotListMembersHandler.isLoading();
  },
  hotListMembers: function () {
    return membersCollection.find(searchQuery, options);
  }
});

Template.hotListMembersList.events({
  'click .removeMember': function (e, ctx) {
    Meteor.call('removeFromHotList', Session.get('entityId'), this._id, function (err, result) {
      setSubscription(searchQuery, options);
    });
    e.preventDefault();
  }
});


/**
 * HotList Members - Item template
 */
Template.hotListMembersListItem.helpers({
  getAcronym: function (str) {
    var matches = str.match(/\b(\w)/g);
    return matches.join('');
  },
  getAddedAt: function () {
    var member = _.findWhere((hotList && hotList.members)||[], {id: this._id});
    return member && member.addedAt;
  }
});