/*
 * view composer for knockout
 */

//settings
Composer = {
    displayErrors: true,
    retryBinding: true,
    errorTemplate: function (msg, element) {
        return '<div class="alert-danger">' + msg + '</div>';
    }
}

/*
 * on startup find the templates that has vieModel defined to hook on template rendered and call knocout
 */
Meteor.startup(function () {
    _.each(_.keys(Template), function (name) {
        if (Template[name].viewModel) {
            Template[name].rendered = function () {
                Composer.composeTemplate(name, this);
            }
        }
    }, {});
});
var executeBinding = function (vm, view) {

    try {
        ko.applyBindings(vm, view);
    } catch (err) {
        handleError(err);
    }
}

Composer.showModal = function (templateName, parameter) {
    var body = $('body');

    var host = $('<div class="modal-host"></div>').appendTo(body);
    var template = Template[templateName];
    var modal = $(template()).appendTo(host);


    modal.modal('show');
    if (Template[templateName].viewmodel)
        executeBinding(new Template[templateName].viewmodel(parameter), modal);

    modal.on('hidden.bs.modal', function (e) {
        ko.cleanNode(this);
        modal.remove();
    });
};


Composer.composeTemplate = function (templateName, context) {
    var templateInstance = context.firstNode;

    if (Template[templateName].waitOn) {
        var waitOn = Template[templateName].waitOn;
        if (typeof waitOn == typeof 'string') {
            waitOn = window[waitOn];
        }
        waitOn.wait(function () {
            var vm = Template[templateName].viewModel.call(this);
            executeBinding(vm, templateInstance);
        });
    } else {
        executeBinding(Template[templateName].viewModel.call(this), templateInstance);
    }

};
Composer.applyBindings = function (vm, view, collectionHandler) {
    //    var executeBinding = function () {
    //        var vmAux = typeof (vm) == "function" ? new vm() : vm;
    //        try {
    //            ko.applyBindings(vmAux, document.getElementsByName(viewName)[0]);
    //        } catch (err) {
    //            handleError(err, viewName);
    //        }
    //    }
    var viewInstance = typeof view == typeof 'string' ? document.getElementsByName(view)[0] : view;

    if (!collectionHandler || !collectionHandler.wait) {
        var vmAux = typeof (vm) == "function" ? new vm() : vm;
        executeBinding(vmAux, viewInstance);
    } else {
        collectionHandler.wait(function () {
            var vmAux = typeof (vm) == "function" ? new vm() : vm;
            executeBinding(vmAux, viewInstance);
        });
    }
};

var handleError = function (err, viewName) {
    if (err.originElement) {
        $(err.originElement).replaceWith(Composer.errorTemplate(err.message));
        return true;
    }
    if (!document.getElementsByName(viewName)[0]) {
        console.err(viewName + ' does not exist');
        return;
    }
    console.err(err)
}