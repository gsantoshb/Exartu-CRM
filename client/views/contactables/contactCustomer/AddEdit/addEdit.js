Template.contactCustomerAddEdit.viewModel = function (contact) {
    var self = this;
    self.contact= Contactables.findOne({ _id: (_.isObject(contact) ? contact._id(): contact) }, { transform: null });

    self.addOrEdit= self.contact.Contact.customer ? 'edit': 'add';
    self.customers= ko.meteor.find(Contactables,{ Customer: { $exists: true } })

    self.add = function () {
        var cont=ko.toJS(self.contact);
        _.each(_.functions(cont),function(funcName){
            delete cont[funcName];
        })
        if(cont.Contact.customer===undefined){
            cont.Contact.customer=null;
        }
        Meteor.call('updateContactable', cont, function(err, result){
            if(!err)
                self.close();
            else{
                console.dir(err);
            }
        })
    }
    return self;
}
