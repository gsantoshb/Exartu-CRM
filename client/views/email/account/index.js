EmailAccountController = RouteController.extend({
    template: 'emailAccountTemplate',
    action: function () {
        if (!this.ready()) {
            this.render('loadingContactable');
            return;
        }
        else
            this.render();
    },
    onAfterAction: function() {
        var title = 'Email Account Configuration',
            description = '';
    }
});

var emailAccount = {

};

Template.emailAccountTemplate.created = function() {
    isCreatingAccount = false;
    var currentAccount = EmailAccounts.findOne() || {};
    var currentAccountDefinition = {
        reactiveProps: {
            username: {
                default: currentAccount.username || "account@email.com",
                validator: Utils.Validators.stringNotEmpty,
                update: 'username'
            },
            password: {
                default: currentAccount.password || "PassWord",
                validator: Utils.Validators.stringNotEmpty,
                update: 'password'
            },
            host: {
                default: currentAccount.host || "imap.email.com",
                validator: Utils.Validators.stringNotEmpty,
                update: 'host'
            },
            port: {
                default: currentAccount.port || 993,
                update: 'port'
            },
            tls: {
                default: currentAccount.tls || true,
                update: 'tls'
            },
            errorMessage: {},
            successMessage: {}

        }
    };
    if(currentAccount._id)
    currentAccountDefinition._id = currentAccount._id;
    emailAccount = Utils.ObjectDefinition(currentAccountDefinition);

}

Template.emailAccountTemplate.emailAccount = function() {
    return emailAccount;
};
var isCreatingAccount = false;
var isCreatingAccountDependency = new Deps.Dependency();

Template.emailAccountTemplate.isCreatingAccount = function() {
    isCreatingAccountDependency.depend();
    return isCreatingAccount;
};

Template.emailAccountTemplate.events = {

    'click #save-emailAccount': function() {
        if (!emailAccount.isValid()) {
            emailAccount.showErrors();
            return;
        }
       isCreatingAccount = true;
       isCreatingAccountDependency.changed();
//        Meteor.call('upsertEmailAccount',emailAccount.getObject(), function(err,res) {
//            isCreatingAccount= false;
//            isCreatingAccountDependency.changed();
//            if (err) {
//                emailAccount.errorMessage.value = err.reason;
//                emailAccount.successMessage.value = '';
//            }
//            else {
//                emailAccount.errorMessage.value = '';
//                emailAccount.successMessage.value = 'Information saved';
//            }
//        });



    }
}

