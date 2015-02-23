var tasksUser = [];
var allTasks = [];
var isLoading = new ReactiveVar();

Template.taskCalendar.created = function(){
    //isLoading.set(true);
    //Meteor.call('apiGetAllTasks', function(error, result){
    //   isLoading.set(false);
    //    allTasks = result;
    //   tasksUser = _.map(result, function(t){
    //        return {title: t.msg, start: t.begin, end: t.end, description:""  }
    //    })
    //})
};





Template.taskCalendar.helpers({
    isLoading: function () {
        return isLoading.get();
    },
    options: function() {
        return {
            id:'myCalendar',
            monthNames:['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'],


            eventClick: function(calEvent, jsEvent, view) {



                // change the border color just for fun
                $(this).css('border-color', 'red');
                task = _.find(allTasks, function(t){
                    return t.msg == calEvent.title;
                });
                Utils.showModal('addEditTask', task)


            },
            header:
            {
                left:   'title',
                center: 'month,basicWeek,basicDay',
                right:  'prev,today,next'
            },
            viewRender: function(view, element){
               calendarDiv=$('#myCalendar');

               Meteor.call('apiGetTasksBeetwen', view.intervalStart.toDate() , view.intervalEnd.toDate() , function(error, result){

                    isLoading.set(false);
                    allTasks = result;
                    _.each(result, function(t){

                           calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:""  } )
                    }



                   )

                })

            }

        }
    }

});