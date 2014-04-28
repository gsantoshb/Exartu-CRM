Template.jobCustomerAddEdit.viewModel = function (job) {
    var self = this;
    self.job= Jobs.findOne({ _id: (_.isObject(job) ? job._id(): job) }, { transform: null });

    self.addOrEdit= self.job.customer ? 'edit': 'add';
    self.customers= ko.meteor.find(Contactables,{ Customer: { $exists: true } });


    self.add = function () {
        var job=ko.toJS(self.job);
        _.each(_.functions(job),function(funcName){
            delete job[funcName];
        })
        if (job.customer === undefined){
            job.customer= null;
        }
        Meteor.call('updateJob', job, function(err, result){
            if(!err)
                self.close();
            else{
                console.dir(err);
            }
        })
    }
    return self;
}
