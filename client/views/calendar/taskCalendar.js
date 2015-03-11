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

var createUrl = function(){
  var urlQuery = new URLQuery();
  if(showMineOnly){
    urlQuery.addParam('owned', true);
  }
  else{
    urlQuery.addParam('owned', false);
  }
  //if(showByMonth){
  //  urlQuery.addParam('view','month');
  //}
  //if(showByWeek){
  //  urlQuery.addParam('view','basicWeek');
  //}
  //if(showByDay){
  //  urlQuery.addParam('view', 'basicDay');
  //}
  //urlQuery.addParam('start', start.getTime());
  //urlQuery.addParam('end', end.getTime());

  urlQuery.apply();

}

var getParamsUrl = function(params){
  //created by
  if(params.owned === "false"){
    showMineOnly = false;
  }
  else{
    showMineOnly = true;
  }
  //view
  //if(params.view === "basicWeek"){
  //  debugger;
  //  showByMonth = false;
  //  showByDay = false;
  //  showByWeek = true;
  //
  //}
  //else if(params.view === "basicDay"){
  //  showByMonth = false;
  //  showByDay = true;
  //  showByWeek = false;
  //
  //}
  //else{
  //  showByMonth = true;
  //  showByDay = false;
  //  showByWeek = false;
  //
  //}
  ////navigate
  //if(params.start){
  //  start = new Date(parseInt(params.start));
  //
  //}
  //if(params.end){
  //  end = new Date(parseInt(params.end));
  //}



 }

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
var loadingDep = new Deps.Dependency();

var handler;
Meteor.autorun(function () {
  // depend start, end
  startEndDep.depend();

  if (!start || !end || (showMineOnly== null)) return;


  createUrl();

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

Template.taskCalendar.created=function() {
  var calendarDiv = $('.fc');

   getParamsUrl(Router.current().params.query);
   startEndDep.changed();

   observe = CalendarTasks.find({}).observe({

    added: function (document) {

      if (!init) return;

      //document = Utils.clasifyTags(document);


      switch (document.state) {
        case Enums.taskState.future:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-future pointer'
          });
          break;
        case Enums.taskState.completed:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-completed pointer'
          });
          break;
        case Enums.taskState.overDue:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-overDue pointer'
          });
          break;
        case Enums.taskState.pending:
          calendarDiv.fullCalendar('renderEvent', {
            id: document._id,
            title: document.msg,
            start: document.begin,
            end: document.end,
            description: "",
            className: 'item-label-2 label-pending pointer'
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

      switch (newDocument.state) {
        case Enums.taskState.future:
          event.className = 'item-label-2 label-future pointer';
          break;
        case Enums.taskState.completed:
          event.className = 'item-label-2 label-completed pointer';
          break;
        case Enums.taskState.overDue:
          event.className = 'item-label-2 label-overDue pointer';
          break;
        case Enums.taskState.pending:
          event.className = 'item-label-2 label-pending pointer';
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
  //handler.stop();
  //observe.stop();
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
      nextDayThreshold: "00:00:00",
      eventLimit: true,
      eventClick: function (calEvent, jsEvent, view) {
        task = _.find(CalendarTasks.find({}).fetch(), function (t) {
          return t._id == calEvent.id;
        });
        Utils.showModal('addEditTask', task)
      },
      header:false,
      timeFormat:'HH:mm',
      views:{
        basicDay:{
          eventLimit:38
        },
        basicWeek:{
          eventLimit:38
        },
        month:{
          eventLimit:5
        }
      },


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
        start = view.intervalStart.toDate();
        var endAux = view.intervalEnd.toDate();
        //this correct the calendar end date
        end = new Date(endAux.setDate(endAux.getDate()+1));
        startEndDep.changed();

        //Meteor.call('apiGetTasksBetween', view.intervalStart.toDate() , view.intervalEnd.toDate() , function(error, result){
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
    startEndDep.depend();
    var calendarDiv = $('.fc');
    return calendarDiv.fullCalendar( 'getView').title;
  }

});


Template.taskCalendar.events = {
  'click #button-addTask': function () {
     Utils.showModal('addEditTask', null);

  },
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



  },
  'click #show-byWeek': function () {
    var calendarDiv = $('.fc');
      calendarDiv.fullCalendar('changeView', 'basicWeek');
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

  },
  'click #show-byDay': function () {
    var calendarDiv = $('.fc');


      calendarDiv.fullCalendar('changeView', 'basicDay');
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

};