Template.addPastJob.viewModel = function (contactableId) {
    var self=this;
    self.pastJob=ko.validatedObservable({
        employerName:ko.observable().extend({required:true}),
        startDate:ko.observable(),
        endDate:ko.observable(),
        jobTitle:ko.observable().extend({required:true}),
        description: ko.observable(),
        tags: ko.observableArray()
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
        Meteor.call('addPastJob',contactableId,js,function(err, result){
            if (err){
                console.log(err);
                self.canAdd(true);
            }else{
                self.canAdd(true);
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