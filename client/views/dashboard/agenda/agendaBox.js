var allTasks = [];
var mineQuery = {};
var showMineOnly = true;
var showToday = true;
var showNext = false;
var showPrev = false;
var showByMonth = true;
var showByWeek = false;
var showByDay = false;
var start;
var end;
var init = false;
var currentDate;
var loadingCount = false;

CalendarController = RouteController.extend({
    template: 'agendaBox'
});

var startEndDep = new Deps.Dependency();
var loadingDep = new Deps.Dependency();

var handler;
Meteor.autorun(function () {
    // depend start, end
    startEndDep.depend();

    if (!start || !end || (showMineOnly== null)) return;

    loadingCount = true;
    loadingDep.changed();

    handler && handler.stop();

    init = false;
    handler = Meteor.subscribe("calendarTasks", start, end, showMineOnly , function () {
        rerender();
        loadingCount = false;
        loadingDep.changed();
    });

});

Template.agendaBox.created=function() {
    var calendarDiv = $('.fc');

    startEndDep.changed();

    //observe = CalendarTasks.find({}).observe({
    //
    //    added: function (document) {
    //
    //        if (!init) return;
    //
    //        switch (document.state) {
    //            case Enums.taskState.future:
    //                calendarDiv.fullCalendar('renderEvent', {
    //                    id: document._id,
    //                    title: document.msg,
    //                    start: document.begin,
    //                    end: document.end,
    //                    description: "",
    //                    className: 'item-label-2 label-future pointer'
    //                });
    //                break;
    //            case Enums.taskState.completed:
    //                calendarDiv.fullCalendar('renderEvent', {
    //                    id: document._id,
    //                    title: document.msg,
    //                    start: document.begin,
    //                    end: document.end,
    //                    description: "",
    //                    className: 'item-label-2 label-completed pointer'
    //                });
    //                break;
    //            case Enums.taskState.overDue:
    //                calendarDiv.fullCalendar('renderEvent', {
    //                    id: document._id,
    //                    title: document.msg,
    //                    start: document.begin,
    //                    end: document.end,
    //                    description: "",
    //                    className: 'item-label-2 label-overDue pointer'
    //                });
    //                break;
    //            case Enums.taskState.pending:
    //                calendarDiv.fullCalendar('renderEvent', {
    //                    id: document._id,
    //                    title: document.msg,
    //                    start: document.begin,
    //                    end: document.end,
    //                    description: "",
    //                    className: 'item-label-2 label-pending pointer'
    //                });
    //                break;
    //        }
    //
    //
    //        rerender();
    //
    //
    //    },
    //
    //    removed:
    //
    //        _.debounce(function (oldDocument) {
    //
    //
    //            var calendarDiv = $('.fc');
    //            calendarDiv.fullCalendar('removeEvents', function (event) {
    //                return event.id == oldDocument._id;
    //            })
    //        }, 500),
    //
    //    changed: function (newDocument, oldDocument) {
    //
    //        var calendarDiv = $('.fc');
    //        var event = _.find(calendarDiv.fullCalendar('clientEvents'), function (ev) {
    //            return oldDocument._id == ev.id;
    //        });
    //
    //        switch (newDocument.state) {
    //            case Enums.taskState.future:
    //                event.className = 'item-label-2 label-future pointer';
    //                break;
    //            case Enums.taskState.completed:
    //                event.className = 'item-label-2 label-completed pointer';
    //                break;
    //            case Enums.taskState.overDue:
    //                event.className = 'item-label-2 label-overDue pointer';
    //                break;
    //            case Enums.taskState.pending:
    //                event.className = 'item-label-2 label-pending pointer';
    //                break;
    //        }
    //        event.title = newDocument.msg;
    //        event.start = newDocument.begin;
    //        event.end = newDocument.end;
    //
    //        calendarDiv.fullCalendar('updateEvent', event);
    //    }
    //})

};

Template.agendaBox.destroyed=function() {};



var rerender = _.debounce(function () {
    var calendarDiv = $('.fc');
    calendarDiv.fullCalendar( 'refetchEvents');
    calendarDiv.find('.fc-month-view > table').addClass('table');
    calendarDiv.find('.fc-month-view table .fc-row.fc-widget-header').attr('style', '');
    init = true;
},650);

Template.agendaBox.helpers({

    options: function () {
        return {
            id: 'dashboard-calendar',
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'],
            nextDayThreshold: "00:00:00",
            eventLimit: true,
            header:false,
            timeFormat:'HH:mm',
            events: function (start, end, timezone, callback) {
                callback(_.map(CalendarTasks.find({}).fetch(), function (t) {
                    switch(t.state) {
                        case Enums.taskState.future:
                            return {id: t._id,title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-future  pointer'  } ;
                            break;
                        case Enums.taskState.completed:
                            return {id: t._id,title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-completed  pointer'  } ;
                            break;
                        case Enums.taskState.overDue:
                            return {id: t._id, title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-overDue  pointer'  } ;
                            break;
                        case Enums.taskState.pending:
                            return {id: t._id, title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-pending  pointer'  };
                            break;
                    }

                }));
            },
            viewRender: function (view, element) {
                //searching by class because id isn't working
                var calendarDiv = $('.fc');
                start = view.start.local().toDate();
                end = view.end.local().toDate();
                //this correct the calendar end date
                //end = new Date(endAux.setDate(endAux.getDate()+1));
                startEndDep.changed();
            },
            eventRender: function( event, element, view ){
                var currentDate = event.start.format('YYYY-MM-DD');
                var calendarDiv = $('.fc');

                var dayCell = calendarDiv.find('td[data-date="'+currentDate+'"]');
                if( dayCell.find('.day-tasks').length ){
                    dayCell.find('.day-tasks').append('<i class="fa fa-circle"></i>');
                }
                else{
                    dayCell.append('<div class="day-tasks"><i class="fa fa-circle"></i></div>');
                }
            },
            dayRender: function(date, cell) {
                //var calendarDiv = $('.fc');
                var currentDate = date.format('D');
                cell.html('<a href="#">'+currentDate+'</a>');
                //
                //console.log('outside : '+currentDate);
                ////console.log(cell);
                //
                //var eventCount = calendarDiv.fullCalendar( 'clientEvents', function(eventObj){
                //    console.log('inside : '+currentDate);
                //    if (eventObj.start.format('YYYY-MM-DD') == currentDate) {
                //        return true;
                //    } else {
                //        return false;
                //    }
                //}).length;
                //console.log(eventCount);
            },
            dayClick: function(date, jsEvent, view) {
                var calendarDiv = $('.fc');
                var events = [];
                var eventCount = calendarDiv.fullCalendar( 'clientEvents', function(eventObj){
                    if( eventObj.start.format('YYYY-MM-DD') == date.format('YYYY-MM-DD') ) {
                        events.push(eventObj);
                        return true;
                    } else {
                        return false;
                    }
                }).length;

                //alert('we have '+eventCount+' events');
                console.log(events);
                if(events.length){
                    //console.log('intra aici');
                    var html = '';
                    if( $('.calendar-widget .list-type-8').length )
                        $('.calendar-widget .list-type-8').html('');
                    else
                        $('.calendar-widget').append('<ul class="list-type-8"></ul>');

                    _.each(events, function(item){
                        var event = Tasks.findOne({_id: item.id});
                        html = '<li><a class="item-icon item-icon-tasks item-icon-sm" href="#"><i class="ico-tasks"></i></a><div class="item-content"><div class="title"><a href="#">';
                        html += task.event;

                        if(event.assign && event.assign.length){
                            var user = Meteor.users.findOne({_id:event.assign.length[0]});
                            var name = (user.username ? user.username : user.emails[0].address);
                            html += '<p class="desc">'+name+'</p>';
                        }
                        else
                            html += '<p class="desc">unassigned</p>';

                        html += '</a></div></div></li>';
                        $('.calendar-widget .list-type-8').append(html);
                    });
                }
            }
        }
    },
    taskCount: {
        title:function(){
            loadingDep.depend();
            if(loadingCount){
                return ""
            }
            return "tasks";
        },



        count: function(){
            loadingDep.depend();
            if(loadingCount){
                return "loading..."
            }
            return CalendarTasks.find({}).count();
        }
    },





    query: function () {
        return query;
    },
    showMineOnly: function () {
        startEndDep.depend();
        return showMineOnly ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showToday: function(){
        startEndDep.depend();
        return showToday ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
        //cambiar el return
    },
    showNext: function(){
        startEndDep.depend();
        return showNext ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showPrev: function(){
        startEndDep.depend();
        return showPrev ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showByMonth: function(){
        startEndDep.depend();
        return showByMonth ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
        //cambiar el return
    },
    showByWeek: function(){
        startEndDep.depend();
        return showByWeek ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showByDay: function(){
        startEndDep.depend();
        return showByDay ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    currentDate: function(){
        var calendarDiv = $('.fc');
        var date = calendarDiv.fullCalendar('getDate');
        var calendarMonth = date.format('YYYY-MM');
        startEndDep.depend();
console.log(calendarMonth);
        if( calendarMonth == moment().format('YYYY-MM') )
            return "Today <span>"+date.format('D')+"<sup>`th</sup> "+date.format('MMMM')+"</span>";
        else
            return calendarDiv.fullCalendar('getView').title;
    }

});


Template.agendaBox.events = {
    'click #next-month-btn': function () {

        var calendarDiv = $('.fc');
        calendarDiv.fullCalendar('next');
        var today = new Date();
        if((today>start) && (today<end)){
            showToday = true;
            showNext = false;
            showPrev = false;
        }
        else if(today>end){
            showToday = false;
            showNext = false;
            showPrev = true;
        }
        else if(today<start){
            showToday = false;
            showNext = true;
            showPrev = false;
        }
        startEndDep.changed();
    },
    'click #prev-month-btn': function () {

        var calendarDiv = $('.fc');
        calendarDiv.fullCalendar('prev');
        var today = new Date();
        if((today>start) && (today<end)){
            showToday = true;
            showNext = false;
            showPrev = false;
        }
        else if(today>end){
            showToday = false;
            showNext = false;
            showPrev = true;
        }
        else if(today<start){
            showToday = false;
            showNext = true;
            showPrev = false;
        }
        startEndDep.changed();
    }
};