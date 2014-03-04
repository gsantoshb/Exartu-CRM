/*
 * view composer for knockout
 */

//settings
Composer = {
    displayErrors: true,
    retryBinding: true,
    errorTemplate: function (msg) {
        return '<div class="alert-danger">' + msg + '</div>';
    }
}

/*
 * on startup find the templates that has vieModel defined to hook on template's rendered and call knockout
 */
Meteor.startup(function () {
    _.each(_.keys(Template), function (name) {
        if (Template[name].viewModel) {
            Template[name].rendered = _.wrap(Template[name].rendered, function (rendered) {
                if (rendered)
                    rendered();
                Composer.composeTemplate(name, this.firstNode);
            });
        }
    }, {});
});
/*
 * log the error, if it's an extended error and display errors is set on true replace the dom
 * return true if the dom was replaced
 */
var handleError = function (err, viewName) {
    console.error(err);
    if (Composer.displayErrors) {
        if (err.originElement) {
            $(err.originElement).replaceWith(Composer.errorTemplate(err.message));
            return true;
        }
    }
    return false;
}
var executeBinding = function (vm, view) {
    try {
        //        if (!ko.dataFor(view)) {
        //            debugger;
        ko.applyBindings(vm, view);
        //        }
    } catch (err) {
        if (handleError(err) && Composer.retryBinding) {
            executeBinding(vm, view);
        }
    }
}

Composer.showModal = function (templateName, parameter) {
    //    debugger;
    var body = $('body');
    var host = body.find(".modal-host")[0];
    if (!host) {
        host = $('<div class="modal-host"> </div>').appendTo(body);
    } else {
        host = $(host);
    }
    _.each(host.children(), function (m) {
        m = $(m);
        ko.cleanNode(m);
        m.modal('toggle');
        m.remove();
        $('.modal-backdrop').remove();
    })

    var template = Template[templateName];
    var modal = $(template()).appendTo(host);


    modal.modal('show');
    if (Template[templateName].viewModel) {
        var aux = function (parameter) {
            var vm = Template[templateName].viewModel;
            return vm.call({
                close: function (parameters) {
                    $(modal).modal('toggle');
                }
            }, parameter);
        }
        executeBinding(new aux(parameter), modal[0]);
    }
    modal.on('hidden.bs.modal', function (e) {
        ko.cleanNode(this);
        modal.remove();
    });
};

/*
 * compose a template
 * parameters:
 *      - templateName
 *      - domNode: the view instance of the template
 */
Composer.composeTemplate = function (templateName, domNode) {
    /*
     * get the view model and waitOns
     */
    var vm = Template[templateName].viewModel;

    var waitOn = Template[templateName].waitOn;
    if (waitOn) {
        //        debugger;
        if (typeof waitOn == typeof[]) {
            var aux = waitOn;
            waitOn = [];
            _.each(aux, function (item) {
                if (typeof item == typeof 'string') {
                    item = window[item];
                }
                if (item.wait) {
                    waitOn.push(item);
                }
            });

        } else {
            if (typeof item == typeof 'string')
                waitOn = window[item];
            if (!waitOn.wait) {
                waitOn = undefined;
            }
        }
        Composer.applyBindings(vm, domNode, waitOn);
    } else {
        Composer.applyBindings(vm, domNode);
    }
}
/*
 * applies ko binding between domNade and vm, waiting for the collection handlers in wait on
 * parameters:
 *  - vm: viewModel contructor
 *  - domNode: a DOM node
 *  - waitOn (optional): an extended collection handler oan array of it
 */
Composer.applyBindings = function (vm, domNode, waitOn) {
    if (waitOn) {
        if (typeof waitOn == typeof[]) {
            /*
             * subscribe to each collection handler through the wait function.
             * record the collections that have been completed (this is currently necessary because some collections make the callback twice)
             */

            var length = waitOn.length;
            var finished = [];
            _.each(waitOn, function (item) {
                item.wait(function (collectionId) {
                    if (!_.contains(finished, collectionId)) {
                        finished.push(collectionId);
                        length = length - 1;
                    }
                    if (length == 0) {
                        executeBinding(vm.call(this), domNode);
                    }
                })
            })

        } else {
            waitOn.wait(function () {
                executeBinding(vm.call(this), domNode);
            });
        }
    } else {
        executeBinding(vm.call(this), domNode);
    };
}