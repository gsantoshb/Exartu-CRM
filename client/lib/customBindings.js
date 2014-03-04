// New ko validation rules

ko.bindingHandlers.bind = {
    init: function () {
        return {
            controlsDescendantBindings: true
        };
    }
};

ko.validation.rules['areSame'] = {
    getValue: function (o) {
        return (typeof o === 'function' ? o() : o);
    },
    validator: function (val, otherField) {
        return val === this.getValue(otherField);
    },
    message: 'The fields must have the same value'
};

ko.validation.rules['uniqueUserInformation'] = {
    async: true,
    validator: function (value, options, callback) {
        var query = {};
        query[options.field] = value;
        Meteor.call('checkUniqueness', query, function (err, result) {
            callback(!err && result);
        });
    },
    message: '{0} is already in use',
};

/*
 * bootstrap date-time picker
 * 
<element> <!--if the element is visible it will hide on click outside this element-->
<div data-bind="dateTimePicker: {date:value,visible:visible, startLimit: startDate, endLimit: endDate}">
<element>
*/
ko.bindingHandlers.dateTimePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {

        var value; //the observable that contains the date
        var visible = true; //an observable with the visible flag
        var startLimit = -Infinity;
        var endLimit = Infinity;
        var options = valueAccessor();

        if (options.visible) {
            visible = ko.utils.unwrapObservable(valueAccessor().visible);
            valueAccessor().visible.subscribe(function (v) {
                if (v) {
                    $(element).show();
                    $('body').on('click', hidder); //to hide inputs on click outside
                } else {
                    $(element).hide();
                }
            });
        }
        if (options.startLimit) {
            startLimit = ko.utils.unwrapObservable(options.startLimit);
        }
        if (options.endLimit) {
            endLimit = ko.utils.unwrapObservable(options.endLimit);
        }
        value = ko.utils.unwrapObservable(valueAccessor().date);
        if (!value.getMonth) {
            value = new Date(value);
        }

        if (!visible) {
            $(element).hide();
        }
        var hidder = function (e) {
            var parent = $(element).parent();
            if ((!$(parent).is(e.target)) && $(parent).has(e.target).length === 0) { //if the click is outside the element's parent
                valueAccessor().visible(false); //hide the element
                $('body').off('click', hidder); //off the click event
            }
        };
        //find  data-pick
        var childrens = $(element).children();
        //insert the input elements for childs with data-pick
        //if the child has no data-pick the is removed from childs because is useless
        ko.utils.arrayForEach(childrens, function (child) {
            switch (insertInput(child)) {
            case "date":
                $(child).datetimepicker({
                    pickTime: false,
                    startDate: startLimit, // set a minimum date
                    endDate: endLimit, // set a maximum date
                });
                $(child).data('datetimepicker').setLocalDate(value);

                $(child).on('changeDate', function (e) {
                    if (!value) {
                        value(new Date);
                        e.localDate = value;
                    }
                    value.setYear(e.localDate.getFullYear());
                    value.setMonth(e.localDate.getMonth());
                    value.setDate(e.localDate.getDate());
                    valueAccessor().date(value);
                });
                break;
            case "time":
                $(child).datetimepicker({
                    pickDate: false,
                    pickSeconds: false,
                    pick12HourFormat: true,
                    startDate: startLimit, // set a minimum date
                    endDate: endLimit // set a maximum date
                });
                $(child).data('datetimepicker').setLocalDate(value);

                $(child).on('changeDate', function (e) {
                    if (!value) {
                        value(new Date);
                        e.localDate = value;
                    }
                    value.setHours(e.localDate.getHours());
                    value.setMinutes(e.localDate.getMinutes());
                    value.setMilliseconds(e.localDate.getMilliseconds());
                    valueAccessor().date(value);
                });
                break;
            case "dateTime":
                $(child).data('datetimepicker').setLocalDate(value);

                $(element).datetimepicker({
                    language: 'en',
                    pickSeconds: false,
                    pick12HourFormat: true,
                    startDate: startLimit, // set a minimum date
                    endDate: endLimit // set a maximum date
                });
                $(child).data('datetimepicker').setLocalDate(value);

                $(child).on('changeDate', function (e) {
                    value(e.localDate);
                    valueAccessor().date(value);
                });
                break;
            default:
                //childrens.remove(child);
            }
        });

    },
    update: function (element, valueAccessor, allBindingsAccessor) {}
};

var insertInput = function (element) {
    var type = element.getAttribute("data-pick");
    element = $(element);
    element.addClass("input-group");
    if (type == "dateTime") {
        element.append('<input class="form-control" data-format="MM/dd/yyyy HH:mm:ss PP" type="text"></input>' +
            '<span class="input-group-addon add-on">' +
            '<i class="glyphicon " data-time-icon="glyphicon-time" data-date-icon="glyphicon-calendar">' +
            '</i>' +
            '</span>');
    } else if (type == "time") {
        element.append('<input class="form-control" data-format="HH:mm:ss PP" type="text"></input>' +
            '<span class="input-group-addon add-on">' +
            '<i class="glyphicon " data-time-icon="glyphicon-time" data-date-icon="glyphicon-calendar">' +
            '</i>' +
            '</span>');
    } else if (type == "date") {
        element.append('<input class="form-control" data-format="MM/dd/yyyy" type="text"></input>' +
            '<span class="input-group-addon add-on">' +
            '<i class="glyphicon " data-time-icon="glyphicon-time" data-date-icon="glyphicon-calendar">' +
            '</i>' +
            '</span>');
    }
    return type;
};

ko.bindingHandlers.executeOnEnter = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var options = valueAccessor() || {};

        var shiftDown = false;

        $(element).onkeydown = function (evt) {
            var evt2 = evt || window.event;
            var keyCode = evt2.keyCode || evt2.which;
            if (keyCode == 16)
                self.shiftDown = true;
        };
        $(element).onkeyup = function (evt) {
            var evt2 = evt || window.event;
            var keyCode = evt2.keyCode || evt2.which;
            if (keyCode == 16)
                self.shiftDown = false;
        };

        $(element).keypress(function (event) {
            if (!event.shiftKey) {
                var keyCode = (event.which ? event.which : event.keyCode);
                var execute = false;
                ko.utils.arrayFirst(options.keys, function (key) {
                    return execute = key == keyCode;
                });
                if (execute) {
                    options.fn.call(viewModel);
                    return false;
                }
                return true;
            }
        });
    }
};


// Register new rules
ko.validation.registerExtenders();