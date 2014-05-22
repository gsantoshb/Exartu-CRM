JobController = RouteController.extend({
    layoutTemplate: 'job',

    data: function () {
        Session.set('entityId', this.params._id); // save current contactable to later use on templates
    }

});


Template.job.waitOn = ['JobHandler', 'ObjTypesHandler', 'ContactMethodsHandler'];

Template.job.viewModel = function () {
    var self = this,
        jobId = Router.current().params._id;


    self.filesCollection = ContactablesFS;

    /*
     * define which field are going to be editable and the read only field which are not saved back to mongo but need to be recomputed after an update
     */
    var fields = ['category', 'duration', 'displayName', 'endDate', 'industry', 'publicJobTitle', 'startDate', 'status', 'tags', 'description'];
    var readOnlyField = ['categoryName', 'durationName', 'industryName', 'statusName']

    self.editMode = ko.observable(false);
    self.edit = function () {
        self.editMode(!self.editMode());
    }
    self.job = ko.meteor.findOne(Jobs, {
        _id: jobId
    });

    /*
     * a clean copy of job to be used in editing mode
     *  when exit edit mode the value of the copy is updated with the value of the original job
     *
     */
    self.editJob = ko.validatedObservable(ko.mapping.fromJS(ko.toJS(self.job)));
//    self.assignedPicture = ko.computed(function () {
//        return helper.getEmployeePictureUrl(self.job().assignmentInfo)
//    });

    self.editMode.subscribe(function (value) {
        if (!value) {
            _.forEach(fields, function (field) {
                self.editJob()[field](self.job()[field]());
            });
            _.forEach(readOnlyField, function (field) {
                self.editJob()[field](self.job()[field]());
            });
            self.editJob().tags(ko.toJS(self.job().tags));
        }
    });


    self.save = function () {
        if (!self.editJob.isValid()) {
            self.editJob.errors.showAllMessages();
            return;
        }
        var set = {};
        var newJob = ko.toJS(self.editJob());
        var oldJob = ko.toJS(self.job());
        _.forEach(fields, function (field) {
            if (newJob[field] != oldJob[field]) {
                set[field] = newJob[field];
            }
        });

        Jobs.update({
            _id: jobId
        }, {
            $set: set
        }, function (err, result) {
            if (!err) {
                self.editMode(false);
            }
        });
    }
    self.newTag = ko.observable();
    self.addTag = function () {
        if (!self.newTag()) {
            return;
        }
        self.editJob().tags.push(self.newTag());
        self.newTag('');

    };
    self.removeTag = function (data) {
        self.editJob().tags.remove(data);
    };
    self.editTag = ko.observable();
    self.assign=function(data){
        Meteor.call('assign', jobId , ko.toJS(data._id),function(err, result){
            if(!err){
            }else{
                console.log(err);
            }
        });
    }

  self.updateNegotiation = function(data) {
    Meteor.call('updateCandidateNegotiation', {jobId: jobId, employeeId: data.employee(), negotiation: data.negotiation()});
    // Collapse editor
    $('#' + data.employee()).collapse('hide');
  }

    return self;
};