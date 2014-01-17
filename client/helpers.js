/*** wraper for ko.applyBindings
*    vm -> viewModel(object) to bind
*    viewName -> string that identify the DOM that holds view (must extist an element with name="viewName")
*    collecionHandler(optional) -> Meteor collection handler extended with our wait function. The binding will apply when the collection is ready
        todo: support multiple collections
***/
var errorElement = function (oldElement, msg) {
	return '<div style="border: solid 1px red;color: red; width:' + $(oldElement).width() + 'px;height:' + $(oldElement).height() + 'px;"> ' + msg + ' </div';
}
helper = {};
_.extend(helper, {
	applyBindings: function (vm, viewName, collectionHandler) {
		var vm = typeof (vm) == "function" ? new vm() : vm;

		if (!collectionHandler || !collectionHandler.wait) {
			try {
				ko.applyBindings(vm, document.getElementsByName(viewName)[0]);
			} catch (err) {
				var element = document.getElementsByName(viewName)[0];
				if (!element) {
					console.log(viewName + ' does not exists');
					return;
				}
				element.innerHTML = errorElement(element, err.message);
				console.log('binding error');
				console.dir(err)
			}
		} else {
			collectionHandler.wait(function () {
				try {
					ko.applyBindings(vm, document.getElementsByName(viewName)[0]);
				} catch (err) {
					var element = document.getElementsByName(viewName)[0];
					if (!element) {
						console.log(viewName + ' does not exists');
						return;
					}
					element.innerHTML = errorElement(element, err.message);
					console.log('binding error');
					console.dir(err)
				}
			});
		}
	},
	fieldVM: function (field) {
		switch (field.type) {
		case 0:
			return 'inStringField';
		case 2:
			return 'inDateField';
		}
	},
});

_.extend(helper, {
	showModal: function (templateName, view, parameter) {
		var modal = $('#' + view),
			originalHTML = modal[0].innerHTML;

		modal.modal('show');
		helper.applyBindings(new Template[templateName].viewmodel(parameter), view);

		modal.on('hidden.bs.modal', function (e) {
			ko.cleanNode(this);
			$(this)[0].innerHTML = originalHTML;
		});
	}
})