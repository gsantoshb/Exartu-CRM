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
    message: '{0} is already in use'
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
        if (!value) {
            value = new Date();
            valueAccessor().date(value);
        }
        if (!value || !value.getMonth) {
            value = new Date(value);
            valueAccessor().date(value);
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
                        endDate: endLimit // set a maximum date
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
                    //                $(child).data('datetimepicker').setLocalDate(value);

                    $(child).datetimepicker({
                        language: 'en',
                        pickSeconds: false,
                        pick12HourFormat: true,
                        startDate: startLimit, // set a minimum date
                        endDate: endLimit // set a maximum date
                    });
                    $(child).data('datetimepicker').setLocalDate(value);

                    $(child).on('changeDate', function (e) {
                        //                    debugger;
                        if (!value) {
                            value(new Date);
                            e.localDate = value;
                        }
                        //                    value.setHours(e.localDate.getHours());
                        //                    value.setMinutes(e.localDate.getMinutes());
                        //                    value.setMilliseconds(e.localDate.getMilliseconds());
                        valueAccessor().date(e.localDate);
                    });
                    break;
                default:
                //childrens.remove(child);
            }
        });

    },
    update: function (element, valueAccessor, allBindingsAccessor) {
    }
};

var insertInput = function (element) {
    var type = element.getAttribute("data-pick");
    element = $(element);
    element.addClass("input-group");
    if (type == "dateTime") {
        element.append('<input class="form-control" data-format="MM/dd/yyyy HH:mm:ss PP" type="text"/>' +
            '<span class="input-group-addon add-on">' +
            '<i class="glyphicon " data-time-icon="glyphicon glyphicon-time" data-date-icon="glyphicon glyphicon-calendar">' +
            '</i>' +
            '</span>');
    } else if (type == "time") {
        element.append('<input class="form-control" data-format="HH:mm:ss PP" type="text"/>' +
            '<span class="input-group-addon add-on">' +
            '<i class="glyphicon " data-time-icon="glyphicon glyphicon-time" data-date-icon="glyphicon glyphicon-calendar">' +
            '</i>' +
            '</span>');
    } else if (type == "date") {
        element.append('<input class="form-control" data-format="MM/dd/yyyy" type="text"/>' +
            '<span class="input-group-addon add-on">' +
            '<i class="glyphicon " data-time-icon="glyphicon glyphicon-time" data-date-icon="glyphicon glyphicon-calendar">' +
            '</i>' +
            '</span>');
    }
    return type;
};

ko.bindingHandlers['switch'] = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var falseElement,
            trueElement;

        var childrens = $(element).children();
        _.each(childrens, function (child) {
            if ($(child).data('switch') == true) {
                trueElement = $(child);
            }
            if ($(child).data('switch') == false) {
                falseElement = $(child);
            }
        });
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (!value) {
            falseElement.hide();
            trueElement.show();

        } else {
            trueElement.hide();
            falseElement.show();
        }


    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //        console.log(this.asd);
        var falseElement,
            trueElement;


        var childrens = $(element).children();
        _.each(childrens, function (child) {
            if ($(child).data('switch') == true) {
                trueElement = $(child);
            }
            if ($(child).data('switch') == false) {
                falseElement = $(child);
            }
        })
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (!value) {
            falseElement.fadeOut('fast', function () {
                trueElement.fadeIn('fast');
            })
        } else {
            trueElement.fadeOut('fast', function () {
                falseElement.fadeIn('fast');
            })
        }
    }
}
var getLatLng = function(address){
    var lat= address.coords ? address.coords.latitud : address.geometry.location.lat();
    var lnt= address.coords ? address.coords.longitud : address.geometry.location.lng();
    return new google.maps.LatLng(lat, lnt);
}
ko.bindingHandlers.map = {
    init: function (element, valueAccessor, allBindingsAccessor) {

        var address = ko.toJS(valueAccessor());


        var mapOptions = {
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(element, mapOptions);
        if (address) {
            $(element).show();
            var location = getLatLng(address)
            map.setCenter(location);
            var marker = new google.maps.Marker({
                map: map,
                position: location
            });
            $(element).data('marker', marker);
        } else {
            $(element).hide();
        }
        $(element).data('map', map);
        $(element).resize(function () {
            google.maps.event.trigger(map, 'resize');
        })
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //        debugger;
        var address = ko.toJS(valueAccessor());
        if (address) {
            $(element).show();
            var map = $(element).data('map');
            var marker = $(element).data('marker');
            var location = getLatLng(address);

//            google.maps.event.trigger(map, 'resize');

            if (!marker) {
                marker = new google.maps.Marker({
                    map: map,
                    position: location
                });
                $(element).data('marker', marker);
            } else {
                marker.setPosition(location);
            }
            map.setCenter(location);
            setTimeout(function(){
                map.setCenter(marker.getPosition());
            },500);

        } else {

            $(element).hide();
        }
    }
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

ko.bindingHandlers.htmlEditor = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var editor = $(element),
            value = valueAccessor();

//        debugger;
        editor.wysihtml5({
            "color": true,
            "size": 'xs',
            "events": {
                "blur": function () {
                    value(editor.val());
                } // TODO: save when content change not in blur event
            }
        });
        editor.val(value());
        editor.width('90%');
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
//        debugger;
        var editor = $(element).data("wysihtml5").editor;
        editor.setValue(ko.utils.unwrapObservable(valueAccessor()));
    }
}

ko.bindingHandlers.sparkLine = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        //        debugger;
        var value = ko.toJS(valueAccessor());
        var text = value.join();

        element.innerHTML = text;
        $(element).sparkline("html", {
            type: "bar",
            fillColor: "#4cd964",
            lineColor: "#4cd964",
            width: "50",
            height: "24"
        });
    }
}

ko.bindingHandlers.bottomScroll = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).find('ul').bind('resize', function () {
            element.scrollTop = element.scrollHeight;
        })
    },
    update: function (element, valueAccessor) {
    }
};
ko.bindingHandlers.onScrollBottom= {
    init: function (element, valueAccessor, allBindingsAccessor) {

        var cb= valueAccessor();
        var height = $(window).height();
        var scrollTop = $(window).scrollTop();
        if(height==scrollTop){
            cb();
        }
        var windowElement=$(window);
        windowElement.bind("scroll", _.debounce(function(){
            if(windowElement.scrollTop() + windowElement.height() > $(document).height() - 50){
                cb();
            }
        },300));
    }
};

ko.bindingHandlers.sidebar={
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var sidebar=$(element),
            body=$('body'),
            trigger=$('#menu-trigger'),
            isOpen=false;
        var minimunWidth=768;

        var hideIfClickOutside=function(e){
            if (!sidebar.is(e.target) && sidebar.has(e.target).length === 0
                && !trigger.is(e.target) && trigger.has(e.target).length === 0) {
                hide();
                body.off('click',hideIfClickOutside);
            }
        }
        var hide=function(){
            body.removeClass('in');
            body.addClass('animating');
            sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
                body.removeClass('animating');
            });

            sidebar.removeClass('in');
            sidebar.addClass('animating');
            sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
                sidebar.removeClass('animating');
            });
            isOpen=false;
        }
        var show=function(){
            sidebar.show();

            body.addClass('in');
            body.addClass('animating');
            sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
                body.removeClass('animating');
            });


            sidebar.addClass('in');
            sidebar.addClass('animating');
            sidebar.on('animationend webkitAnimationEnd oAnimationEnd', function() {
                sidebar.removeClass('animating');
            });
            isOpen=true;
        }
        var start=function(){
            isOpen=false;
            trigger.unbind( "click" );
            trigger.click(function(){
                if(isOpen){
                    hide();
                } else {
                    show();
                    body.click(hideIfClickOutside);
                }
            })
        }
        var stop = function(){
            sidebar.removeClass('in');
            body.removeClass('in');
            body.off('click',hideIfClickOutside);
            trigger.unbind( "click" );
        };
        if ($(window).width() < minimunWidth){
            start();
        }
        $(window).resize(_.debounce(function(){
            if ($(window).width() < minimunWidth){
                start();
            }else{
                stop();
            }
        },400));
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
}

// Register new rules
ko.validation.registerExtenders();