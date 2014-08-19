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

ko.bindingHandlers.sparkLine = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
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
        console.log('init sidebar')
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
            body.off('click',hideIfClickOutside);
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
              console.log('click on trigger')
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

ko.bindingHandlers.select2 = {
  init: function (element, valueAccessor) {
    var options = _.map(ko.isObservable(valueAccessor().options)? valueAccessor().options(): valueAccessor().options, function(option){
      option.id = ko.isObservable(option._id)? option._id(): option._id;
      option.text = ko.isObservable(option.displayName)? option.displayName() : option.displayName;

      return option;
    });
    var selectedValues = valueAccessor().selectedValues;
    var filter = valueAccessor().filter;

    $(element).select2({
      data: options
    });

    var add = function(data){
      if (_.isArray(selectedValues())) {
        if (_.findWhere(selectedValues(), {id: data.id}) == undefined)
          selectedValues.push(filter? filter(data) : data);
      }
      else
        selectedValues(filter? filter(data) : data);
    };

    ko.utils.registerEventHandler(element, "select2-selected", function (data) {
        add(data.choice)
    });
  }
};
ko.bindingHandlers.placeholder = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    var underlyingObservable = valueAccessor();
    ko.applyBindingsToNode(element, { attr: { placeholder: underlyingObservable } } );
  }
};

// Register new rules
ko.validation.registerExtenders();