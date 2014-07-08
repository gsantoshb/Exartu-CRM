// accept just a contactable (add a new past job) or edit an existing past job
Template.addEditPastJob.viewModel = function (contactableId, pastJob) {
    var self=this;
    self.modalTitle=ko.observable();
    self.acceptButton=ko.observable();
    var pj=_.isObject(pastJob) && _.isFunction(pastJob.employerName) ? ko.toJS(pastJob): pastJob;

    if (!pj){
        self.pastJob=ko.validatedObservable({
            employerName:ko.observable().extend({required:true}),
            startDate:ko.observable(),
            endDate:ko.observable(),
            jobTitle:ko.observable().extend({required:true}),
            description: ko.observable(),
            tags: ko.observableArray()
        })
        self.modalTitle('Add');
        self.acceptButton('Add');
    } else{
        self.pastJob=ko.validatedObservable({
            employerName:ko.observable(pj.employerName).extend({required:true}),
            startDate:ko.observable(pj.startDate),
            endDate:ko.observable(pj.endDate),
            jobTitle:ko.observable(pj.jobTitle).extend({required:true}),
            description: ko.observable(pj.description),
            tags: ko.observableArray(pj.tags),
            _id: ko.observable(pj._id)
        });
        self.modalTitle('Edit');
        self.acceptButton('Save');
    }
    self.canAcept=ko.observable(true);
    self.accept=function(){
        if (! self.pastJob.isValid()){
            self.pastJob.errors.showAllMessages();
            return;
        }
        self.canAcept(false);
        var pjJson=ko.toJS(self.pastJob);
        _.each(_.functions(pjJson),function(key){
                delete pjJson[key];
        });
        Meteor.call('addEditPastJob', contactableId, pjJson,function(err, result){
            if (err){
                console.log(err);
                self.canAcept(true);
            }else{
                self.canAcept(true);
                self.close();
            }
        })
    };
    self.newTag=ko.observable();
    self.addTag=function(){
        if (! self.newTag()){
            return;
        }
        self.pastJob().tags.push(self.newTag());
        self.newTag('');
    }
    return self;
}