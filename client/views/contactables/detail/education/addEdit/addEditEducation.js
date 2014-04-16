// accept just a contactable (add a new past job) or edit an existing past job
Template.addEditEducation.viewModel = function (contactableId, education) {
    var self=this;
    self.modalTitle=ko.observable();
    self.acceptButton=ko.observable();
    var edu=_.isObject(education) && _.isFunction(education.schoolName) ? ko.toJS(education): education;

    if (!edu){
        self.education=ko.validatedObservable({
            schoolName:ko.observable().extend({required:true}),
            field:ko.observable().extend({required:true}),
            degree:ko.observable().extend({required:true}),
            startDate:ko.observable(),
            endDate:ko.observable(),
            description: ko.observable(),
            tags: ko.observableArray()
        })
        self.modalTitle('Add');
        self.acceptButton('Add');
    } else{
        self.education=ko.validatedObservable({
            schoolName:ko.observable(edu.schoolName).extend({required:true}),
            field:ko.observable(edu.field).extend({required:true}),
            degree:ko.observable(edu.degree).extend({required:true}),
            startDate:ko.observable(edu.startDate),
            endDate:ko.observable(edu.endDate),
            description: ko.observable(edu.description),
            tags: ko.observableArray(edu.tags),
            _id: ko.observable(edu._id)
        });
        self.modalTitle('Edit');
        self.acceptButton('Save');
    }
    self.canAcept=ko.observable(true);
    self.accept=function(){
        if (! self.education.isValid()){
            self.education.errors.showAllMessages();
            return;
        }
        self.canAcept(false);
        var eduJson=ko.toJS(self.education);
        _.each(_.functions(eduJson),function(key){
                delete eduJson[key];
        });
        Meteor.call('addEditEducations', contactableId, eduJson,function(err, result){
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
        self.education().tags.push(self.newTag());
        self.newTag('');
    }
    return self;
}