/**
 * Created by ramiro on 01/04/15.
 */
clickFunnelController = RouteController.extend({
  template: 'clickFunnel'

});

Template.clickFunnel.helpers({
  link: function(){
    debugger;
    return  ""+window.location.origin+"/API/1/ClickFunnelsHook/"+Meteor.user()._id;
  }
});