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


var info = new Utils.ObjectDefinition({
  reactiveProps: {
    contactablesCount: {},
    objType: {},
    isFiltering: {
      default: true
    },
    isLoading: {
      default: false
    }
  }
});

CalendarController = RouteController.extend({
  template: 'taskCalendar'
});

var startEndDep = new Deps.Dependency();

Meteor.autorun(function () {
  // depend start, end
  startEndDep.depend();

  if (!start || !end || (showMineOnly== null)) return;

  init = false;
  Meteor.subscribe("tasks2", start, end, showMineOnly , function () {
    rerender();
  });

});

Template.taskCalendar.created=function() {


   observe = Tasks.find({}).observe({

    added: function (document) {

      if (!init) return;

      //document = Utils.clasifyTags(document);

      var calendarDiv = $('.fc');
      switch (document.state) {
        case Enums.taskState.future:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-future'
          });
          break;
        case Enums.taskState.completed:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-completed'
          });
          break;
        case Enums.taskState.overDue:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-overDue'
          });
          break;
        case Enums.taskState.pending:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-pending'
          });
          break;
      }


      rerender();


    },

    removed:

      _.debounce(function (oldDocument) {


      var calendarDiv = $('.fc');
      calendarDiv.fullCalendar('removeEvents', function (event) {
        return event.id == oldDocument._id;
      })
    }, 500),

    changed: function (newDocument, oldDocument) {

      var calendarDiv = $('.fc');
      var event = _.find(calendarDiv.fullCalendar('clientEvents'), function (ev) {
        return oldDocument._id == ev.id;
      });
      newDocument = Utils.clasifyTags(newDocument);
      switch (newDocument.state) {
        case Enums.taskState.future:
          event.className = 'item-label-2 label-future';
          break;
        case Enums.taskState.completed:
          event.className = 'item-label-2 label-completed';
          break;
        case Enums.taskState.overDue:
          event.className = 'item-label-2 label-overDue';
          break;
        case Enums.taskState.pending:
          event.className = 'item-label-2 label-pending';
          break;

      }
      event.title = newDocument.msg;
      event.start = newDocument.begin;
      event.end = newDocument.end;


      calendarDiv.fullCalendar('updateEvent', event);

    }
  })

};

Template.taskCalendar.destroyed=function() {

  observe.stop();
};



var rerender = _.debounce(function () {
  var calendarDiv = $('.fc');
  calendarDiv.fullCalendar( 'refetchEvents' );
  init = true;
},650);

Template.taskCalendar.helpers({
  options: function () {
    return {
      id: 'myCalendar',
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'],
      eventLimit: 5,
      eventClick: function (calEvent, jsEvent, view) {
        // change the border color just for fun

        $(this).css('border-color', 'red');
        task = _.find(Tasks.find({}).fetch(), function (t) {
          return t._id == calEvent.id;
        });
        Utils.showModal('addEditTask', task)
      },
      header: {
        left: 'title',
        center: 'month,basicWeek,basicDay',
        right: 'prev,today,next'
      },

      events: function (start, end, timezone, callback) {
        callback(_.map(Tasks.find().fetch(), function (t) {
            switch(t.state) {
                        case Enums.taskState.future:
                             return {id: t._id,title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-future'  } ;
                             break;
                        case Enums.taskState.completed:
                            return {id: t._id,title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-completed'  } ;
                             break;
                        case Enums.taskState.overDue:
                            return {id: t._id, title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-overDue'  } ;
                            break;
                        case Enums.taskState.pending:
                            return {id: t._id, title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-pending'  };
                            break;
           }

        }));
      },
      viewRender: function (view, element) {
        //searching by class because id isn't working
        var calendarDiv = $('.fc');
        start = view.intervalStart.toDate();
        end = view.intervalEnd.toDate();
        startEndDep.changed();

        //Meteor.call('apiGetTasksBeetwen', view.intervalStart.toDate() , view.intervalEnd.toDate() , function(error, result){
        //
        //    allTasks = result;
        //    _.each(result, function(t){
        //         t = Utils.clasifyTags(t);
        //         switch(t.state) {
        //             case Enums.taskState.future:
        //                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-future'  } );
        //                 break;
        //             case Enums.taskState.completed:
        //                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-completed'  } );
        //                 break;
        //             case Enums.taskState.overDue:
        //                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-overDue'  } );
        //                 break;
        //             case Enums.taskState.pending:
        //                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-pending'  } );
        //                 break;
        //         }
        //
        //
        //    }
        //
        //
        //
        //   )

      }
    }
  },
  taskCount: function () {
    return Tasks.find({}).count();
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
  }

});


Template.taskCalendar.events = {
  'click #show-mineOnly': function () {
    showMineOnly = !showMineOnly;
    startEndDep.changed();

  },
  'click #show-Today': function () {
    showToday = true;
    showNext = false;
    showPrev = false;
    var calendarDiv = $('.fc');
    calendarDiv.fullCalendar('today');
    startEndDep.changed();



  },
  'click #show-Next': function () {

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
  'click #show-Prev': function () {

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



  },
  'click #show-byMonth': function () {
    var calendarDiv = $('.fc');

    if(calendarDiv.fullCalendar( 'getView').title != 'month') {
      calendarDiv.fullCalendar('changeView', 'month');
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
      showByMonth = true;
      showByDay = false;
      showByWeek = false;

      startEndDep.changed();
    }


  },
  'click #show-byWeek': function () {
    var calendarDiv = $('.fc');

    if(calendarDiv.fullCalendar( 'getView').title != 'agendaWeek') {

      calendarDiv.fullCalendar('changeView', 'agendaWeek');
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
      showByMonth = false;
      showByDay = false;
      showByWeek = true;
      startEndDep.changed();
    }
  },
  'click #show-byDay': function () {
    var calendarDiv = $('.fc');

    if(calendarDiv.fullCalendar( 'getView').title != 'agendaDay') {
      calendarDiv.fullCalendar('changeView', 'agendaDay');
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
      showByMonth = false;
      showByDay = true;
      showByWeek = false;

      startEndDep.changed();
    }

  }

};