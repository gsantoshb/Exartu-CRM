/**
 * Created by ramiro on 20/05/15.
 */
Meteor.call('getIndexTour', "tourActivities", function(err,cb) {
 if(cb===false){
   //you have to do the tour
   Router.go("/");
 }
 else if(cb<4){
   //you just started the dashboard part of the tour
   Router.go("/");
 }
 else if(cb<9) {
   debugger;
   Router.go("/contactables");
 }
 else if(cb<14){
   Router.go("/jobs");
 }
  else if(cb<18){
   Router.go("/placements");
 }
  else if(cb<22){
   Router.go("/tasks");
 }
 else if(cb<27){
   Router.go("/notes");
 }

});