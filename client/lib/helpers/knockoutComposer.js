/*
 * view composer for knockout
 */

//settings
Composer = {
    displayErrors: true,
    retryBinding: true,
    numberOfRetries:8,
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
 * log the error, if it's an extended error and display errors is set to true replace the dom
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
//    debugger;
    var retries = Composer.numberOfRetries;
    var keepTring = true;
    while (retries > 0 && keepTring)
    {
        retries=retries-1;
        try {
            ko.applyBindings(vm, view);
            keepTring=false;
        } catch (err) {
            if (handleError(err) && Composer.retryBinding) {
//                executeBinding(vm, view);
            }else{
                keepTring=false;
            }
        }
    }

}

Composer.showModal = function (templateName) {

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
    var parameters = Array.prototype.slice.call(arguments, 1);

    var template = Template[templateName];
    UI.insert(UI.renderWithData(template, parameters), host[0])
    var modal = host.children();


    modal.modal('show');
    if (Template[templateName].viewModel) {
        var aux = function () {
            var vm = Template[templateName].viewModel;
            return vm.apply({
                close: function () {
                    $(modal).modal('toggle');
                }
            }, parameters);
        }
        executeBinding(new aux(), modal[0]);
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
    if (Template[templateName].config) {
        if (Template[templateName].config.singleton) {
            vm = _.wrap(vm, function (vm) {
                if (!Template[templateName]._instance) {
                    Template[templateName]._instance = vm();
                }
                return Template[templateName]._instance;
            })
        }
    }

    var waitOn = Template[templateName].waitOn;
    if (waitOn) {
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
            if (typeof waitOn == typeof 'string')
                waitOn = window[waitOn];
            if (!waitOn.wait) {
                waitOn = undefined;
            } else {
                waitOn = [waitOn];
            }
        }
        Composer.applyBindings(vm, domNode, waitOn);
    } else {
        Composer.applyBindings(vm, domNode);
    }
}
var vmContext = {};
/*
 * applies ko binding between domNode and vm, waiting for the collection handlers in wait on
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
                        executeBinding(vm.call(vmContext), domNode);
                    }
                })
            })

        } else {
            waitOn.wait(function () {
                executeBinding(vm.call(vmContext), domNode);
            });
        }
    } else {
        executeBinding(vm.call(vmContext), domNode);
    };
}