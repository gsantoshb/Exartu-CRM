var handlerContactalbeCounters;
ContactableController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    handlerContactalbeCounters = Meteor.subscribe('contactableCounters', this.params._id)

    return [Meteor.subscribe('singleContactable', this.params._id),
      Meteor.subscribe('linkedAddresses', this.params._id),
      Meteor.subscribe('auxHotLists', this.params._id),
      GoogleMapsHandler,
      handlerContactalbeCounters,
      Meteor.subscribe('singleHotList', Session.get('hotListId')),
      Meteor.subscribe('allHotLists')]
  },
  data: function () {
    Session.set('entityId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    if (!Contactables.findOne(Session.get('entityId'))) {
      this.render('notFoundTemplate');
      return;
    }

    this.render('contactable');

    Session.set('activeTab', this.params.tab || 'details');
  },
  onAfterAction: function () {
    var title = Session.get('contactableDisplayName'),
      description = 'Contact information';
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
//
Utils.reactiveProp(self, 'editHotlistMode', false);
Template.contactable.created = function () {
  self.editHotlistMode = false;
};

Template.contactable.rendered = function () {
  $('body').scrollTop(0);
};

Template.contactable.destroy = function () {
  console.log("onDestroyed", handlerContactalbeCounters);
  handlerContactalbeCounters.stop();
};

StatusNoteEditMode = {
  val: false,
  dep: new Deps.Dependency,
  show: function () {
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed()
  }
}

Object.defineProperty(StatusNoteEditMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function (newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var contactable;
var contactDep = new Deps.Dependency;

Template.contactable.helpers({
  created: function () {
    StatusNoteEditMode.hide();
  },
  objTypeDisplayName: function () {
    return Utils.getContactableType(this);
  },
  contactable: function () {
    contactable = Contactables.findOne({
      _id: Session.get('entityId')
    });
    if (!contactable) return;
    Session.set('contactableDisplayName', contactable.displayName);

    // if contactable is an 'Employee' then add it to last used employees list
    if (contactable.objNameArray.indexOf('Employee') != -1) {
      Meteor.call('setLastUsed', Enums.lastUsedType.employee, contactable._id);
    }

    contactDep.depend();
    return contactable;
  },

  contactableStatusNote: function () {
    return contactable.statusNote;
  },

  statusNoteEditMode: function () {
    return StatusNoteEditMode.value;
  },

  // Information to dynamic templates
  collection: function () {
    return Contactables;
  },

  // Counters
  documentCount: function () {
    return ContactablesFS.find({'metadata.entityId': Session.get('entityId')}).count() + Resumes.find({employeeId: Session.get('entityId')}).count()
  },
  noteCount: function () {
    return Notes.find({links: {$elemMatch: {id: Session.get('entityId')}}}).count();
  },
  jobCount: function () {
    return Jobs.find({'client': Session.get('entityId')}).count();
  },

  currentTemplate: function () {
    var selected = _.findWhere(tabs, {id: Session.get('activeTab')});
    return selected && selected.template;
  }
});

Template.contactable.events({
  // Picture edit
  'click #edit-pic': function () {
    $('#edit-picture').trigger('click');
  },

  'click #edit-mode-status-note': function (e) {
    if (StatusNoteEditMode.value)
      StatusNoteEditMode.hide();
    else
      StatusNoteEditMode.show();


  },
  'click #cancelStatusNote': function (e) {
    if (StatusNoteEditMode.value)
      StatusNoteEditMode.hide();
  },
  'click #saveStatusNote': function (e) {
    var statusNote = $('input[name=statusNote]').val();
    console.log(Session.get('entityId'));
    Contactables.update({
      _id: Session.get('entityId')
    }, {
      $set: {
        'statusNote': statusNote
      }
    });
    if (StatusNoteEditMode.value)
      StatusNoteEditMode.hide();
    contactDep.changed();
  },

  'change #edit-picture': function (e) {
    if (e.target.files && e.target.files[0]) {
      var fsFile = new FS.File(e.target.files[0]),
        contactableId = Session.get('entityId');

      if (fsFile != undefined) {

        fsFile.metadata = {
          entityId: contactableId,
          owner: Meteor.userId(),
          name: fsFile.name()
        };

        var file = ContactablesFS.insert(fsFile, function () {
        });

        Meteor.call('updateContactablePicture', contactableId, file._id);
      }
    }
  },
  // Actions
  'click #makeEmployee': function () {
    doTransform('employee');
  },
  'click #makeContact': function () {
    doTransform('contact');
  },
  'click #generate-resume': function () {
    var employeeId = this._id;
    var downloadLink = $('#download-generated-resume');
    Utils.showModal('basicModal', {
      title: 'Generate Employee Resume/CV',
      message: 'Show employee contact information on resume/cv?',
      buttons: [{label: 'Hide', classes: 'btn-info', value: false}, {
        label: 'Show',
        classes: 'btn-success',
        value: true
      }],
      callback: function (result) {
        downloadLink.attr('href', FileUploader.getUrl('generateResume', employeeId, {showContactInfo: result}));
        downloadLink[0].click();
      }
    });
  },
  'click .goBack': function () {
    history.back();
  }
});
var doTransform = function (type) {
  return Utils.showModal('basicModal', {
    title: 'Employee and Contact',
    message: 'Make this record be both an Employee and a Contact. Continue?',
    buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
      label: 'Ok',
      classes: 'btn-success',
      value: true
    }],
    callback: function (result) {
      if (result && type == 'contact') {
        var lkp = LookUps.findOne({lookUpCode: Enums.lookUpCodes.contact_status, isDefault: true});
        if (!lkp) {
          alert('There is no default contact process status, so you can not create a contact.');
          return;
        }
        Contactables.update({_id: Session.get('entityId')}, {
          $set: {
            Contact: {status: lkp._id}
          },
          $push: {objNameArray: 'Contact'}
        });
      }
      ;
      if (result && type == 'employee') {
        var lkp = LookUps.findOne({lookUpCode: Enums.lookUpCodes.employee_status, isDefault: true});
        if (!lkp) {
          alert('There is no default employee process status, so you can not create an employee.');
          return;
        }
        ;
        var emp = {status: lkp._id, taxID: ''};
        Contactables.update({_id: Session.get('entityId')}, {
          $set: {
            Employee: emp
          },
          $push: {objNameArray: 'Employee'}
        });
      }
      ;
    }
  });
};

// Action Buttons
Template.contactable_actions.helpers({
  hasEmailAddress: function () {
    var emailCMTypes = _.pluck(LookUps.find({
      lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
      lookUpActions: {
        $in: [
          Enums.lookUpAction.ContactMethod_Email,
          Enums.lookUpAction.ContactMethod_PersonalEmail,
          Enums.lookUpAction.ContactMethod_WorkEmail
        ]
      }
    }).fetch(), '_id');
    var email = _.find(contactable.contactMethods, function (cm) {
      return _.indexOf(emailCMTypes, cm.type) != -1
    });
    return (email) ? true : false;
  },

  // Applicant Center
  isAppCenterUser: function () {
    // Registered users have the user property set
    return !!contactable.user;
  },
  alreadyInvited: function () {
    // Invited users have the invitation property set
    return !!contactable.invitation;
  }
})
;
Template.contactable_actions.events({
  'click #sendAppCenterInvite': function () {
    Utils.showModal('sendAppCenterInvitation', contactable);
  },
  'click #sendEmailTemplate': function () {
    var contactableType = Utils.getContactableType(this);
    var categories = [];

    // Get the category for each type of contact
    _.each(contactableType.split('/'), function (type) {
      switch (type) {
        case 'Client':
          categories.push(MergeFieldHelper.categories.client.value);
          break;
        case 'Employee':
          categories.push(MergeFieldHelper.categories.employee.value);
          break;
        case  'Contact':
          categories.push(MergeFieldHelper.categories.contact.value);
          break;
      }
    });

    // Choose the template to send
    Utils.showModal('sendEmailTemplateModal', {
      categories: categories,
      callback: function (result) {
        if (result) {
          var emailCMTypes = _.pluck(LookUps.find({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            lookUpActions: {
              $in: [
                Enums.lookUpAction.ContactMethod_Email,
                Enums.lookUpAction.ContactMethod_PersonalEmail,
                Enums.lookUpAction.ContactMethod_WorkEmail
              ]
            }
          }).fetch(), '_id');
          var email = _.find(contactable.contactMethods, function (cm) {
            return _.indexOf(emailCMTypes, cm.type) != -1
          });

          Meteor.call('sendEmailTemplate', result, [{
            contactableId: contactable._id,
            email: email.value
          }], function (err, result) {
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
      }
    });
  }
});

var editingContactMethods = new ReactiveVar(false);
var email;
var phone;
// Header
Template.contactable_header.helpers({
    mainContactMethods: function () {

        var result = {};
        var contactMethodsTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
        _.some(this.contactMethods, function (cm) {
            var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
            if (!type)
                return false;
            if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email)) {
              result.email = cm;
              email = cm;
            }
            if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Phone)) {
              result.phone = cm;
              phone = cm;
            }
            if (!result.email || !result.phone) {
               return false;
            }

            return true;
        });
        if(!result.phone && !result.email){
          return false
        }
        else{
          return result;
        }
    },
    pictureUrl: function () {
        if (this.pictureFileId) {
            return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
        }
        return "/assets/user-photo-placeholder.jpg";
    },
    getLocationDisplayName: function () {
        return Utils.getLocationDisplayName(this._id);
    },
    isAppCenterUser: function () {
        // Registered users have the user property set
        return !!contactable.user;
    },
    editingContact: function(){
      return editingContactMethods.get();
    },
    contactMethods: function () {
      var toReturn = {}
      if (email) {
        toReturn.email = this.email.value;
      }
      if (phone) {
        toReturn.phone = this.phone.value;
      }
      return toReturn;
  }

});

AutoForm.hooks({
  updateContactMethod: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var arrayToUpdate = [];
      var self = this;
      var count = 0;
      var end = (function () {
        ++count;
        if (count == 2){
          Meteor.call("updateContactMethod", contactable._id, arrayToUpdate, function() {
             editingContactMethods.set(false);
             self.done();

          });
        }

      })

      if(phone) {
        if(insertDoc.phone != phone.value) {
          arrayToUpdate.push({newValue: insertDoc.phone, oldValue: phone.value, type: phone.type});
        }
      }
      end()
      if(email) {
        if(insertDoc.email != email.value){
        Meteor.call('checkContactableEmail', insertDoc.email, function (err, res) {
          if (err) {
            //throw error "Error checking email
          }
          else {
            if (res.length >= 1) {
              var listaString = "";
              _.forEach(res, function (r) {
                var link = "" + window.location.origin + "/contactable/" + r._id;
                listaString = listaString + "<a target='_blank' href=" + link + ">" + r.displayName + "</a>" + "<br/>";
              });
              Utils.showModal('basicModal', {
                title: 'Existing email',
                message: 'The following contactables have the same email you are trying to use:<br/><br/>' + listaString,
                buttons: [{label: 'Cancel', classes: 'btn-info', value: false}, {
                  label: 'Continue',
                  classes: 'btn-success',
                  value: true
                }],
                callback: function (result) {
                  if (result) {
                    arrayToUpdate.push({newValue:insertDoc.email, oldValue: email.value, type:email.type});
                    //Meteor.call("updateContactMethod", contactable._id, insertDoc.email, email.value, email.type, function(){
                    end();
                  }
                }
              });
            }
            else {
              arrayToUpdate.push({newValue:insertDoc.email, oldValue: email.value, type:email.type});
              end();


            }
          }
        });
        }
        else{
          end();
        }
      }else {
        end();
      }
      return false;
    }
  }
});


Template.contactable_header.events({
  "click #edit-mode-contactMethods": function () {
    editingContactMethods.set(!editingContactMethods.get());
  }
})
// Details
Template.contactable_details.helpers({
  collection: function () {
    return Contactables;
  },

  setNewAddress: function () {
    return function (newAddress) {
      Meteor.call('setContactableAddress', Session.get('entityId'), newAddress);
    }
  }
});

// Tabs
Template.contactable_nav.helpers({
  isActive: function (id) {
    return (id == Session.get('activeTab')) ? 'active' : '';
  }
});

var tabs;

Template.contactable_nav.helpers({
  tabs: function () {
    tabs = [
//      {id: 'activities', displayName: 'Activities', template: 'entityActivities'},
      {id: 'details', mobileDisplayName: 'Detail', displayName: 'Details', template: 'contactable_details'},
      {
        id: 'notes',
        mobileDisplayName: 'Note',
        displayName: 'Notes',
        template: 'contactable_notes',
        icon: 'icon-note-paper-1',
        info: function () {
          return ContactableCounter.findOne('notes').count;
        }
      },
      {
        id: 'documents',
        mobileDisplayName: 'Documents',
        displayName: 'Documents',
        template: 'contactable_documents',
        icon: 'icon-document-1',
        info: function () {
          return ContactableCounter.findOne('contactablesFiles').count + Resumes.find({employeeId: contactable._id}).count();
        }
      },
      {
        id: 'tasks',
        mobileDisplayName: 'Tasks',
        displayName: 'Tasks',
        template: 'contactable_tasks',
        icon: 'icon-note-paper-1',
        info: function () {
          return ContactableCounter.findOne('tasks').count;
        }
      }
    ];

    if (contactable.Client) {
      tabs.push({id: 'jobs', mobileDisplayName: 'Job', displayName: 'Jobs', template: 'contactable_jobs'});
      tabs.push({
        id: 'placements',
        mobileDisplayName: 'Placements',
        displayName: 'Placements',
        template: 'contactable_placements'
      });
    }

    if (contactable.Employee) {
      tabs.push({
        id: 'placements',
        mobileDisplayName: 'Placements',
        displayName: 'Placements',
        template: 'contactable_placements',
        info: function () {
          return ContactableCounter.findOne('placements').count;
        }
      });
      //tabs.push({id: 'hrconcourse', displayName: 'HRconcourse', template: 'contactable_HRConcourse'});
      tabs.push({
        id: 'education',
        mobileDisplayName: 'Education',
        displayName: 'Education',
        template: 'employeeEducation',
        info: function () {
          return Template.parentData(2).education ? Template.parentData(2).education.length : 0;
        }
      });
      tabs.push({
        id: 'pastJobs',
        mobileDisplayName: 'Past Jobs',
        displayName: 'Past Jobs',
        template: 'employeePastJobs',
        info: function () {
          return Template.parentData(2).pastJobs ? Template.parentData(2).pastJobs.length : 0;
        }
      });

      // Check if it has a doc Center account or has been invited to Applicant Center or is already a user
      if (!!contactable.docCenter || contactable.invitation || contactable.user) {
        tabs.push({
          id: 'docCenter',
          mobileDisplayName: 'App. Center',
          displayName: 'Applicant Center',
          template: 'docCenterTab'
        });
      }
    }
    return tabs;
  }
});


var hotListMembershipsDep = new Deps.Dependency;
var selectedValue = "";

Template.hotListMembershipsBox.helpers({
  hotListMemberships: function () {
    hotListMembershipsDep.depend();
    return hotlists = HotLists.find({members: contactable._id});
  },
  recentHotList: function () {
    var obj;
    if (Session.get('hotListId')) {
      hotListMembershipsDep.depend();
      var contactableObjName = [];
      _.forEach(contactable.objNameArray, function (c) {
        contactableObjName.push(c.toLowerCase());
      })
      var h = HotLists.findOne({
        _id: Session.get('hotListId'),
        members: {$nin: [contactable._id]},
        category: {$in: contactableObjName}
      });

      if (h) {
        var lastHotList = HotLists.findOne({_id: Session.get('hotListId')});
        obj = {};
        obj.hotListId = Session.get('hotListId');
        obj.hotListDisplayName = lastHotList.displayName;
      }

    }
    return obj;
  },
  editHotlistMode: function () {
    return self.editHotlistMode;
  },
  getHotList: function () {
    var templateSelf = this;

    return function (string) {
      var self = this;
      var contactableObjName = [];
      _.forEach(contactable.objNameArray, function (c) {
        contactableObjName.push(c.toLowerCase());
      })
      var result = AllHotLists.find({
        members: {$nin: [contactable._id]},
        category: {$in: contactableObjName},
        displayName: {$regex: ".*" + string + ".*", $options: 'i'}
      }).fetch();
      var array = _.map(result, function (r) {
        return {text: r.displayName, id: r._id};
      });
      self.ready(array);
    };
  },
  hotListChanged: function () {
    var self = this;
    return function (value) {
      self.value = value;
      selectedValue = value;
    }
  }
});

var addHotList = function () {
  if (!selectedValue) {
    return;
  }
  var hotlist = AllHotLists.findOne({_id: selectedValue});
  if (hotlist.members) {
    hotlist.members.push(contactable._id);
  }
  else {
    hotlist.members = [contactable._id];
  }
  hotlist.members = $.unique(hotlist.members);
  Meteor.call('updateHotList', hotlist, function (err, cb) {
    if (!err) {
      hotListMembershipsDep.changed();
    }
  })
  //hack
  Template.instance().$('input[type=hidden]').data().select2.clear();
};

Template.hotListMembershipsBox.events({
  'click #edit-mode': function (e, ctx) {
    self.editHotlistMode = !self.editHotlistMode;
  },
  'click .removeHotList': function (e, ctx) {
    var hotlist = HotLists.findOne({_id: this._id});
    hotlist.members.splice(hotlist.members.indexOf(contactable._id), 1);
    HotLists.update({_id: hotlist._id}, {$set: {members: hotlist.members}});
    hotListMembershipsDep.changed();
  },
  'click .addHotList': function (e, ctx) {
    var id = Session.get('hotListId');
    var hotlist = HotLists.findOne({_id: id});
    hotlist.members.push(contactable._id);
    hotlist.members = $.unique(hotlist.members);

    HotLists.update({_id: hotlist._id}, {$set: {members: hotlist.members}});
    hotListMembershipsDep.changed();
  },
  'click .add-hotList': function (e, ctx) {
    addHotList.call(this);
  }
});

