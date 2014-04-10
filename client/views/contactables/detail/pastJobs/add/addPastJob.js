Template.addPastJob.viewModel = function (contactableId) {
    var self=this;
    self.pastJob=ko.validatedObservable({
        employerName:ko.observable().extend({required:true}),
        startDate:ko.observable(),
        endDate:ko.observable(),
        jobTitle:ko.observable().extend({required:true}),
        description: ko.observable()
    })
    self.canAdd=ko.observable(true);
    self.add=function(){
        if (! self.pastJob.isValid()){
            self.pastJob.errors.showAllMessages();
            return;
        }
        self.canAdd(false);
        var js=ko.toJS(self.pastJob);
        _.each(_.functions(js),function(key){
                delete js[key];
            });
        debugger;
        Meteor.call('addPastJob',contactableId,js,function(err, result){
            debugger;
            if (err){
                console.log(err);
                self.canAdd(true);
            }else{
                self.canAdd(true);
                self.close();
            }
        })

    };
    return self;
}