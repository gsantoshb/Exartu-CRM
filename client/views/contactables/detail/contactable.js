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
            Meteor.subscribe('singleHotList', Session.get('hotListId'))]
    },
    data: function () {
           Session.set('entityId', this.params._id);
    },
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
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
//Utils.reactiveProp(self, 'editHotlistMode', false);
//Template.contactable.created = function () {
//    self.editHotlistMode=false;
//};

Template.contactable.rendered = function () {
    $('body').scrollTop(0);
};

Template.contactable.destroy = function(){
    console.log("onDestroyed",handlerContactalbeCounters );
    handlerContactalbeCounters.stop();
};


var contactable;
Template.contactable.helpers({
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

        return contactable;
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
    'change #edit-picture': function (e) {
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
        var type = Utils.getContactableType(this);
        var contactMethodsTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
        var email = _.find(this.contactMethods, function (cm) {
            var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
            if (type && type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email))
                return true;
        });
        return (email) ? true : false;
    },
    emailTemplateContext: function () {
        var type = Utils.getContactableType(this);
        var contactMethodsTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
        var email = _.find(this.contactMethods, function (cm) {
            var cmtype = _.findWhere(contactMethodsTypes, {_id: cm.type});
            if (cmtype && cmtype.lookUpActions && _.contains(cmtype.lookUpActions, Enums.lookUpAction.ContactMethod_Email))
                return true;
        });
        var context = {};
        if (type.search('/')>-1) {
            var typearray = type.split(/[\s/]+/); // create array if multi type entity
            var cats = [];
            _.forEach(typearray, function (t) {
                cats.push(Enums.emailTemplatesCategories[t.toLowerCase()]);
                context[t]=Session.get('entityId');
            });
            context.category= cats;
            context.recipient= email && email.value
        }
        else {

            context = {
                category: [Enums.emailTemplatesCategories[type.toLowerCase()]],
                recipient: email && email.value
            };
            context[type] = Session.get('entityId');
        }
        return context;
    },
    isAppCenterUser: function () {
        // Registered users have the user property set
        return !!contactable.user;
    }
    ,
    alreadyInvited: function () {
        // Invited users have the invitation property set
        return !!contactable.invitation;
    }
})
;
Template.contactable_actions.events({
    'click #sendAppCenterInvite': function () {
        Utils.showModal('sendAppCenterInvitation', contactable);
    }
});

// Header
Template.contactable_header.helpers({
    mainContactMethods: function () {
        var result = {};
        var contactMethodsTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode}).fetch();
        _.some(this.contactMethods, function (cm) {
            var type = _.findWhere(contactMethodsTypes, {_id: cm.type});
            if (!type)
                return false;
            if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Email))
                result.email = cm;
            if (type.lookUpActions && _.contains(type.lookUpActions, Enums.lookUpAction.ContactMethod_Phone))
                result.phone = cm;

            if (!result.email || !result.phone)
                return false;

            return true;
        });

        return result;
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
    }
});

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
                mobileDisplayName: 'Doc',
                displayName: 'Documents',
                template: 'contactable_documents',
                icon: 'icon-document-1',
                info: function () {
                    return ContactableCounter.findOne('contactablesFiles').count;
                }
            },
            {
                id: 'tasks',
                mobileDisplayName: 'Task',
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
                mobileDisplayName: 'Place',
                displayName: 'Placements',
                template: 'contactable_placements'
            });
        }

        if (contactable.Employee) {
            tabs.push({
                id: 'placements',
                mobileDisplayName: 'Place',
                displayName: 'Placements',
                template: 'contactable_placements',
                info: function () {
                    return ContactableCounter.findOne('placements').count;
                }
            });
            //tabs.push({id: 'hrconcourse', displayName: 'HRconcourse', template: 'contactable_HRConcourse'});
            tabs.push({
                id: 'education',
                mobileDisplayName: 'Ed.',
                displayName: 'Education',
                template: 'employeeEducation',
                info: function () {
                    return Template.parentData(2).education ? Template.parentData(2).education.length : 0;
                }
            });
            tabs.push({
                id: 'pastJobs',
                mobileDisplayName: 'Past',
                displayName: 'Past Jobs',
                template: 'employeePastJobs',
                info: function () {
                    return Template.parentData(2).pastJobs ? Template.parentData(2).pastJobs.length : 0;
                }
            });
            tabs.push({
                id: 'docCenter',
                mobileDisplayName: 'HRConcourse',
                displayName: 'HRConcourse',
                template: 'docCenterTab'
            });
        }
        return tabs;
    }
});
var hotListMembershipsDep = new Deps.Dependency;

Template.hotListMembershipsBox.helpers({
    hotListMemberships: function () {
        hotListMembershipsDep.depend();
        return hotlists = HotLists.find({members: contactable._id});
    },
    recentHotList: function () {
        var obj;
        if (Session.get('hotListId')) {
            obj = {};
            obj.hotListId = Session.get('hotListId');
            obj.hotListDisplayName = Session.get('hotListDisplayName')
        }
        return obj;
    //},
    //editHotlistMode: function () {
    //    return self.editHotlistMode;
    }
});
Template.hotListMembershipsBox.events({
    //'click #edit-mode':function(e, ctx) {
    //    self.editHotlistMode = ! self.editHotlistMode;
    //},
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
    }
});

