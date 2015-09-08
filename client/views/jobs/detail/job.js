var jobCollections = Jobs;

JobController = RouteController.extend({
    layoutTemplate: 'mainLayout',
    waitOn: function () {
        return [Meteor.subscribe('singleJob', this.params._id), Meteor.subscribe('jobCounters', this.params._id)]
    },
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action: function () {

        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        Session.set('activeTab', this.params.tab || 'details');

        Meteor.call('addLastEntry',{entity: this.params._id,type: Enums.linkTypes.job.value},function(err,res){
        });
        this.render('job')
    },
    onAfterAction: function () {
        var title = Session.get('jobDisplayName'),
            description = 'Job information';
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

//var generateReactiveObject = function (job) {
//    return new dType.objInstance(job, jobCollections);
//};

var job;
var client;
var originalJob;
var statusNoteEditMode;
Template.job.onCreated(function () {
    statusNoteEditMode = new ReactiveVar(false);
    originalJob = new ReactiveVar();
    this.autorun(function () {
        originalJob.set(jobCollections.findOne({_id: Session.get('entityId')}));
    });

    job = new ReactiveVar();

    if (!originalJob.get()) return;

    Session.set('jobDisplayName', originalJob.get().displayName);

    //if (!job.get()){
    //    job.set(generateReactiveObject(originalJob.get()));
    //}
});

Template.job.helpers({
    jobStatusNote: function () {
        return originalJob.get() && originalJob.get().statusNote;
    },
    statusNoteEditMode: function () {
        return statusNoteEditMode.get();
    },

    originalJob: function () {
        return originalJob.get()
    },
    currentTemplate: function () {
        var selected = _.findWhere(tabs, {id: Session.get('activeTab')});
        return selected && selected.template;
    }
});

Template.job_header.helpers({
    location: function () {
        return originalJob.get() && originalJob.get().address;
    },
    getLocationDisplayName: function () {
        return Utils.getLocationDisplayName(this._id);
    }
});

Template.job_details.helpers({
    originalJob: function () {
        return originalJob.get();
    },
    getClient: function () {
        //todo: find another way to do this
        if (Template.parentData(1).__helpers[" originalJob"]())
            return Template.parentData(1).__helpers[" originalJob"]().client;
    },
    clientCollection: function () {
        return Contactables;
    }
});

Template.job.events({
    'click #edit-mode-status-note': function () {
        statusNoteEditMode.set(! statusNoteEditMode.get());
    },
    'click #cancelStatusNote': function(e) {
        statusNoteEditMode.set(false);
    },
    'click #saveStatusNote': function(e, ctx) {
        var statusNote = ctx.$('input[name=statusNote]').val();
        jobCollections.update({
            _id: Session.get('entityId')
        }, {
            $set: {
                'statusNote': statusNote
            }
        });
        statusNoteEditMode.set(false);
    },
    'click #copy-job': function () {
        Utils.showModal('basicModal', {
            title: 'Job copy',
            message: 'Copy job?',
            buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
                label: 'Copy',
                classes: 'btn-success',
                value: true
            }],
            callback: function (result) {
                if (result) {
                    Meteor.call('copyJob', Session.get('entityId'), function (err, result) {
                        if (!err) {
                            Router.go('/job/' + result);
                        } else {
                            console.log(err);
                        }
                    });
                }
            }
        });
    }
});

var tabs;

Template.job_nav.helpers({
    tabs: function () {
        tabs = [
            {id: 'details', displayName: 'Details', template: 'job_details'},
            {
                id: 'notes', displayName: 'Notes', template: 'job_notes', info: function () {
                return JobCounter.findOne('notes').count;
            }
            },
            {id: 'description', displayName: 'Description', template: 'job_description'},
            {
                id: 'placements', displayName: 'Placements', template: 'job_placements', info: function () {
                return JobCounter.findOne('placements').count;
            }
            },
            {
               id: 'call-em', displayName:'Call-em', template:'job_call-em', info: function(){
              return JobCounter.findOne('workFlows').count;
            }
            }
        ];
        return tabs;
    },
    getEntityId: function () {
        return Session.get('entityId');
    }
});

