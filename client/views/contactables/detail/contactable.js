ContactableController = RouteController.extend({
    layoutTemplate: 'contactable',
    data: function () {
        Session.set('entityId', this.params._id);
    },
    action: function () {
        // define which template to render in function of the url's hash

        switch (this.params.hash) {
            case 'details':
                this.render('contactableDetails', {
                    to: 'content'
                });
                break;
            case 'posts':
                this.render('contactablePosts', {
                    to: 'content'
                });
                break;
            case 'documents':
                this.render('documents', {
                    to: 'content'
                });
                break;
            case 'pastJobs':
                this.render('contactablePastJobs', {
                    to: 'content'
                });
                break;
            case 'educations':
                this.render('contactableEducation', {
                    to: 'content'
                });
                break;
            case 'documents':
                this.render('documents', {
                    to: 'content'
                });
                break;
            case 'pastJobs':
                this.render('contactablePastJobs', {
                    to: 'content'
                });
                break;
            default:
                this.render('contactableHome', {
                    to: 'content'
                });
                break;
        }
        ;
    }
//    onBeforeAction:function(){
//        $('.nav-pills-' + this.params.hash).addClass('active');
//    }
});
Template.contactable.rendered=function(){
    var asd=function(){
        var hash=Router.current().params.hash || 'home';
        $('.nav-pills>.active').removeClass('active');
        $('.nav-pills-' + hash).addClass('active');
    }
    Meteor.autorun(asd);
}
Template.contactable.helpers({
    contactable: function(){
        return Contactables.findOne({
            _id: Session.get('entityId')
        })
    },
    pictureUrl:function(){
        if (this.pictureFileId){
            return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
        }
        return "/assets/user-photo-placeholder.jpg";
    }
})

Template.contactable.events({
    'click .edit-pic':function(){
        $('#edit-picture').trigger('click');
    },
    'change #edit-picture': function(e){
        var fsFile = new FS.File(e.target.files[0]),
            contactableId=Session.get('entityId');
        fsFile.metadata = {
            entityId: contactableId,
            owner: Meteor.userId(),
            name: fsFile.name
        };
        var file = ContactablesFS.insert(fsFile);
        Meteor.call('updateContactablePicture', contactableId, file._id);
    },
    'click .send-message':function(e){
        Composer.showModal('sendMessage', $data);
    }
//    'click .nav-pills': function(e){
//        $('.nav-pills>.active').removeClass('active')
//        $(e.target.parentElement).addClass('active');
//    }
})
//Template.contactable.__viewModel = function () {
//    var self = {},
//        contactableId = Router.current().params._id;
//    _contactableId=contactableId;
//    var obsId=ko.observable(contactableId);
//
//    self.contactable = ko.meteor.findOne(Contactables, ko.computed(function(){
//        _contactableId=obsId();
//        contactableId=obsId();
//        return {
//            _id: obsId()
//        };
//    }));
//
//    self.filesCollection = ContactablesFS;
//
//    self.getObjTypeData = function (data) {
//        if (data.Employee) return data.Employee;
//        if (data.Customer) return data.Customer;
//        if (data.Contact) return data.Contact;
//    };
//    self.activeTab = ko.dep(function () {
//        return Router.current().params.hash || 'home';
//    });
//    self.contactablePicture = ko.observable(ContactablesFS.getThumbnailUrl(self.contactable().pictureFileId()));
//    self.contactable.subscribe(function(){
//        self.contactablePicture(ContactablesFS.getThumbnailUrl(self.contactable().pictureFileId()));
//        _contactablePicture=self.contactablePicture();
//    })
//    _contactablePicture=self.contactablePicture()
//    self.pictureUrl = ko.computed(function() {
//        if (self.contactablePicture()().ready())
//            return self.contactablePicture()().picture();
//        else
//            return undefined;
//    });
//
//    self.editContactablePicture = function () {
//        $('#edit-picture').trigger('click');
//    };
//
//    $('#edit-picture').off('change', updatePicture);
//    $('#edit-picture').change(updatePicture);
//
//    // Extra information on header for each objType
//    self.getHeaderInfoVM = function (data) {
//        if (data.Employee) return 'employee-header';
//        if (data.Customer) return 'empty-header';
//        if (data.Contact) return 'contact-header';
//    };
//
//    var updateVM=function(){
//        var id=Session.get('entityId');
//        obsId(id);
//
//    }
//    Meteor.autorun(updateVM);
//    return self;
//};
//hack: the vm is called multiple times, so the image was being uploaded multiple times
//      a temp fix is to take the uploadfunction out of the vm, so i can make the $(...).off('change', updatePicture)
//      to make this i had to have this two variables (the ones with _...) with the data from the vm that is needed here
//var _contactableId;
//var _contactablePicture;
//var updatePicture=function (e) {
//    var fsFile = new FS.File(e.target.files[0]);
//    fsFile.metadata = {
//        entityId: _contactableId,
//        owner: Meteor.userId(),
//        name: fsFile.name
//    };
//    var file = ContactablesFS.insert(fsFile); //, function(err, result) {
//    ContactablesFS.getThumbnailUrl(file._id, _contactablePicture);
//    Meteor.call('updateContactablePicture', _contactableId, file._id);
//    //});
//}

//Template.contactable.rendered = function () {
//    // TODO: Avoid mutliple bindings
//    // Remove old binding to avoid multiple calls
//    var nodeIds = ['edit-picture-btn'];
//    _.forEach(nodeIds, function (nodeId) {
//        node = $('#' + nodeId)[0];
//        if (node)
//            ko.cleanNode(node);
//    })
//};