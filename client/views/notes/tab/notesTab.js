/**
 * Created by ramiro on 03/06/15.
 */
var self = {};
var searchQuery = {};
var addDisabled = new ReactiveVar(false);

//remind date
var showRemindDate = new ReactiveVar(false);
var clickedCheckboxOrButton = false;
var text = new ReactiveVar('');
var detectedSpan = new ReactiveVar();
var updatingRemindDate = new ReactiveVar(false);

var checkSMSDep = new Deps.Dependency;
var NotesHandler;

// Links
var links,
  linkedDep = new Tracker.Dependency();


AutoForm.hooks({
  AddNoteRecord: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {

      addDisabled.set(true);
      if (!hotlist) {
        var self = this;
        //for some reason autoValue doesn't work

        insertDoc.contactableId = Session.get('entityId');

        Meteor.call('addContactableNote', insertDoc, function () {
          self.done();
          addDisabled.set(false);
          showRemindDate.set(false);
          clickedCheckboxOrButton = false;
          text.set("");
          detectedSpan.set();
        })
      }
      else if (hotlist) {
        var self = this;
        insertDoc.hierId = Meteor.user().currentHierId;
        insertDoc.userId = Meteor.user()._id;
        Meteor.call('addNote', insertDoc, function () {
          self.done();
          addDisabled.set(false);
        })
      }
      else {

      }
      return false;
    }

  }
});

self.defaultUserNumber = null;
self.defaultMobileNumber = null;
var hotlist = null;
var responsesOnly = false;
Template.notesTabAdd.events({
  'change #sendAsSMS': function () {
    checkSMSDep.changed();
  },
  'change #show-remind-date-checkbox': function (e, ctx) {
    clickedCheckboxOrButton = true;
    showRemindDate.set(e.target.checked);

    // default to 'next weeks'
    if (e.target.checked && !detectedSpan.get()){
      detectedSpan.set(timeSpanDictionary.nextWeek);
    }
  },
  'click .time-span': function () {
    clickedCheckboxOrButton = true;
    setSelectedTimeSpan(this);
  },
  'keyup #noteMsg': function (e, ctx) {
    text.set(e.target.value);
  }
});
Template.notesTab.created = function () {
  addDisabled.set(false);
  showRemindDate.set(false);

  hotlist = HotLists.findOne({_id: Session.get('entityId')});

  responsesOnly = (this.data && this.data.responseOnly);

  Session.set('showNotesRemindDate', false);
};
Template.notesTab.destroyed = function () {
  Session.set('showNotesRemindDate', false);
};
Template.notesTabAdd.helpers({
  addDisabled: function () {
    return addDisabled.get() ? 'disabled' : '';
  },
  isHotListNote: function () {
    return (hotlist) ? true : false; // hide numbers if hotlist
  },
  isContactableNote: function () {
    var contactable = Contactables.findOne(this._id);
    return (contactable) ? true : false; // hide numbers if hotlist
  },
  mobileNumbers: function () {

    var contactable = Contactables.findOne(this._id);
    if (!contactable) return;
    return Utils.getContactableMobilePhones(contactable).map(function (number) {
      var result = {
        label: number,
        value: number
      };
      if (!self.defaultMobileNumber) self.defaultMobileNumber = result.value;
      return result;
    });
  },
  userNumbers: function () {
    var user = Meteor.user();
    return Hierarchies.find({_id: user.currentHierId, phoneNumber: {$exists: true}}).map(function (userHier) {
      var result = {
        label: userHier.phoneNumber.value, //displayName + ' - ' + userHier.name,
        value: userHier.phoneNumber.value
      };
      if (!self.defaultUserNumber) self.defaultUserNumber = result.value;
      return result;
    });
  },
  defaultMobileNumber: function () {
    return self.defaultMobileNumber;
  },
  defaultUserNumber: function () {
    return self.defaultUserNumber;
  },
  ischeckedSMS: function () {
    checkSMSDep.depend();
    var field = $("#sendAsSMS");
    return (field[0] && field[0].checked);
  },
  getRemindDate: function () {
      return detectedSpan.get() ? detectedSpan.get().getTime() : null
  },
  showRemindDate: function () {
    return showRemindDate.get();
  },
  timeSpans: function () {
    return _.toArray(timeSpanDictionary);
  },
  remindDate: function () {
    return detectedSpan.get() ? detectedSpan.get().getTime() : undefined;
  },
  updatingRemindDate: function () {
    return updatingRemindDate.get();
  },
  isSelectedSpan: function () {
    return this == detectedSpan.get();
  }
});


// List
var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {}
  }
});

Template.notesTabList.created = function () {
  var self = this;

  self.autorun(function () {
      searchQuery = {};
      if (responsesOnly && hotlist) //means only get responses to a hotlist send
      {
        searchQuery['isReply'] = true;
        searchQuery.links = {
          $elemMatch: {
            id: Session.get('entityId')
          }
        };
        searchQuery.msg = {
          $regex: query.searchString.value,
          $options: 'i'
        };

        if (!NotesHandler) {
          NotesHandler = Meteor.paginatedSubscribe('notesView', {filter: searchQuery});
          NotesHandler.setFilter(searchQuery);


        } else {
          NotesHandler.setFilter(searchQuery);
          //NotesHandler.setOptions(hotlist);

        }
      }
      else if (hotlist) {
        searchQuery['isReply'] = {$exists: false};
        searchQuery.links = {
          $elemMatch: {
            id: Session.get('entityId')
          }
        };
        searchQuery.msg = {
          $regex: query.searchString.value,
          $options: 'i'
        };
        if (!NotesHandler) {
          NotesHandler = Meteor.paginatedSubscribe('notesView', {filter: searchQuery});
          NotesHandler.setFilter(searchQuery);

        } else {
          NotesHandler.setFilter(searchQuery);


        }
      }
      else {

        searchQuery.links = {
          $elemMatch: {
            id: Session.get('entityId')
          }
        };
        searchQuery.msg = {
          $regex: query.searchString.value,
          $options: 'i'
        };

        var options ={};
        if (selectedSort.get()) {
          var selected = selectedSort.get();
          options.sort = {};
          options.sort[selected.field] = selected.value;

          if (selected.field == "remindDate"){
            searchQuery.remindDate = { $ne: null };
          }
        } else {
          delete options.sort;
        }

        if (!NotesHandler) {
          NotesHandler = Meteor.paginatedSubscribe('notesView', {filter: searchQuery});
        } else {
          NotesHandler.setFilter(searchQuery);
        }
        setTimeout(function () {
          NotesHandler.setOptions(options);
        }, 500);

      }
    });

  var contactable = Contactables.findOne(Session.get('entityId'));
  if (contactable && (contactable.Client || contactable.Contact)){
    self.autorun(function () {
      // if the user selected a time span or clicked the checkbox then i don't have to find a span in the text
      if (clickedCheckboxOrButton)
        return;
      var s = getMatchingTimeSpan(text.get());
      setSelectedTimeSpan(s);
      showRemindDate.set(!! s);
    })
  }
};
Template.notesTabList.destroyed = function () {
  query.searchString.value = '';
  NotesHandler.stop();
  NotesHandler = undefined;
  text.set('');
}
Template.notesTabList.helpers({
  hasItems: function () {
    return (NotesView.find(searchQuery, {sort: {dateCreated: -1}}).fetch().length > 0);
  },
  items: function () {
    //var selected = selectedSort.get();
    //var options = {};
    //if(selected){
    //  options.sort = {};
    //  options.sort[selected.field] = selected.value;
    //}
    //
    //console.log(NotesView.find({}, {}).count());
    return NotesView.find({}, {});
  },
  isLoading: function () {
    return NotesHandler.isLoading();
  },
  query: function () {
    return query;
  },
  showRemindDate: function () {
    return   Session.get('showNotesRemindDate');
  }
});
Template.notesTabList.events({
  'keyup #searchString': _.debounce(function (e) {
    query.searchString.value = e.target.value;
  })
});

// Record

Template.notesTabItem.helpers({
  getCtx: function () {
    var self = this;
    return {
      noteRecord: self,
      isEditing: new ReactiveVar(false)
    };
  },
  isEditing: function () {
    return this.isEditing.get();
  },
  getUrl: Utils.getHrefFromLink
});

Template.notesTabItem.events({
  'click .deleteNoteRecord': function () {
    var self = this;
    Utils.showModal('basicModal', {
      title: 'Delete note',
      message: 'Are you sure you want to delete this note?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
        label: 'Delete',
        classes: 'btn-danger',
        value: true
      }],
      callback: function (result) {
        if (result) {
          Meteor.call('removeNote', self._id);
        }
      }
    });
  },
  'click .editNoteRecord': function () {
    // Open edit mode
    this.isEditing.set(!this.isEditing.get());
  }
});

// Edit record

Template.notesTabEditItem.helpers({
  created: function () {
    var self = this;

    self.data.formId = Random.hexString(10);
  }
});

Template.notesTabEditItem.events({
  'click .cancelNoteRecordChanges': function () {
    // Close edit mode
    var ctx = Template.parentData(1);
    ctx.isEditing.set(!ctx.isEditing.get());
  }
});

// Links

Template.linksAutoForm.created = function () {
  var self = this;

  var initialLink = {
    id: Session.get('entityId'),
    type: Utils.getEntityTypeFromRouter()
  };
  Meteor.call('getEntityFromLinkForAdd', initialLink, function (err, res) {
    if (res) {
      _.extend(initialLink, res);
      links = self.data.value || [initialLink];
      linkedDep.changed();
    }
  })


};

AutoForm.addInputType('linkInput', {
  template: 'linksAutoForm',
  valueOut: function () {
    return links
  }
});

Template.linksAutoForm.events({
  'click #toggleAddNoteModal': function () {
    Utils.showModal('noteAdd', function (data) {
      data = data || {};
      if (_.findWhere(links, {id: data.id})) return false;
      Meteor.call('getEntityFromLinkForAdd', data, function (err, res) {
        if (res) {
          _.extend(data, res);
          links.push(data);
          linkedDep.changed();
          Utils.dismissModal();
        }
      })

    });
  },
  'click .btn-remove': function (e) {
    e.preventDefault();

    //Template.currentData().links = _.without(links, this);
    var link = this;
    var newLinks;
    _.each(links, function (l) {
      if (l.id == link._id) {
        newLinks = links.filter(function (element) {
          return element.id != l.id
        });
      } else {
        return;
      }
    });
    links = newLinks;
    linkedDep.changed();

    return false;
  }
});

Template.linksAutoForm.helpers({
  links: function () {
    linkedDep.depend();
    return links;
  }
});

var setSelectedTimeSpan = function (newVal) {
  //hack to force dateTimePicker to re-render with the new value
  if (detectedSpan.curValue != newVal){
    updatingRemindDate.set(true);
    setTimeout(function () {
      updatingRemindDate.set(false);
    }, 100);
  }

  detectedSpan.set(newVal);
};

// returns the first span object from the timeSpanDictionary which regex matches the text
// the order it uses is the order of the dictionary
var getMatchingTimeSpan = function (text) {
  var result;
  _.any(timeSpanDictionary, function (span, key) {
    if (span.regex.test(text)) {
      result = span;
      return true;
    }
  });
  return result;
};

// all the time span that we can recognize
// the Label is used to display the button in the UI (if no label, no button)
timeSpanDictionary = {
  later: {
    regex: /\b(later|later\stoday|today)\b/i,
    label: 'In three hours',
    getTime: function () {
      return moment().add(3, 'h').toDate();
    }
  },
  tomorrowMorning: {
    regex: /\b(tomorrow\smorning|early\stomorrow)\b/i,
    label: '',
    getTime: function () {
      var date = moment().add(1, 'd');
      date.hour(10);
      date.minutes(0);
      return date.toDate();
    }
  },
  tomorrow: {
    regex: /\b(tomorrow)\b/i,
    label: 'Tomorrow',
    getTime: function () {
      return moment().add(1, 'd').toDate();
    }
  },
  nextDays: {
    regex: /\b(next\sdays|couple\sof\sdays|soon|upcoming\sdays|in\sthe\scoming\sdays|this\sweek)\b/i,
    label: 'In two days',
    getTime: function () {
      return moment().add(2, 'd').toDate();
    }
  },
  inThreeDays: {
    regex: /\b(next\sfew\sdays)\b/i,
    label: '',
    getTime: function () {
      return moment().add(3, 'd').toDate();
    }
  },
  nextWeek: {
    regex: /\b(next\sweek|in\sa\sweek)\b/i,
    label: 'Next week',
    getTime: function () {
      return moment().add(1, 'w').toDate();
    }
  },
  inTwoWeeks: {
    regex: /\b(near\sfuture)\b/i,
    label: '',
    getTime: function () {
      return moment().add(2, 'w').toDate();
    }
  },
  nextMonth: {
    regex: /\b(next\smonth|in\sa\smonth)\b/i,
    label: 'Next month',
    getTime: function () {
      return moment().add(1, 'M').toDate();
    }
  }
};

// week days mornings
_.each(moment.weekdays(), function (dayName, dayIndex) {
  timeSpanDictionary[dayName.toLowerCase() + 'Morning'] = {
    regex: new RegExp('\\b('+ dayName.toLowerCase() + '\\smorning)\\b'),
    label: null,
    getTime: function () {
      var date = moment().day(dayIndex);
      date.hour(10);
      date.minutes(0);
      return date.toDate();
    }
  }
});
// week days
_.each(moment.weekdays(), function (dayName, dayIndex) {
  timeSpanDictionary[dayName.toLowerCase()] = {
    regex: new RegExp('\\b('+ dayName.toLowerCase() + ')\\b'),
    label: null,
    getTime: function () {
      return moment().day(dayIndex).toDate();
    }
  }
});





// list sort
var selectedSort = new ReactiveVar();


selectedSort.field = 'dateCreated';
selectedSort.value = -1;
var sortFields = [
  {field: 'dateCreated', displayName: 'Creation date'},
  {field: 'remindDate', displayName: 'Remind date'}
];

Template.noteTabSort.helpers({
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

Template.noteTabSort.events = {
  'click .sort-field': function () {
    setSortField(this);
  }
};
