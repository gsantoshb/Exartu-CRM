var allTasks = [];






Template.taskCalendar.helpers({

    options: function() {
        return {
            id:'myCalendar',
            monthNames:['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'],
            eventLimit: 5,


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
                //searching by class because id isn't working
                var calendarDiv=$('.fc');



               Meteor.call('apiGetTasksBeetwen', view.intervalStart.toDate() , view.intervalEnd.toDate() , function(error, result){
                    console.log('result', result);
                    allTasks = result;
                    _.each(result, function(t){
                         t = Utils.clasifyTags(t);
                         switch(t.state) {
                             case Enums.taskState.future:
                                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-future'  } );
                                 break;
                             case Enums.taskState.completed:
                                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-completed'  } );
                                 break;
                             case Enums.taskState.overDue:
                                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-overDue'  } );
                                 break;
                             case Enums.taskState.pending:
                                 calendarDiv.fullCalendar( 'renderEvent',{title: t.msg, start: t.begin, end: t.end, description:"", className:'item-label-2 label-pending'  } );
                                 break;
                         }


                    }



                   )

                })

            }

        }
    }

});