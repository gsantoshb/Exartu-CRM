UI.registerHelper('paypalButton', function(){

  //todo: find a better way to do this
  var templateName= 'paypal';

  //mode
  if (window.location.hostname=='crm.exartu.com' || window.location.hostname=='exartucrm.herokuapp.com/'){
    //nothing
  }
  else{
    templateName += 'Test';
  }
  //button type
  templateName += (this.type || 'Enterprise');

  Template[templateName].helpers({
    hierId: function(){
      return Meteor.user().hierId;
    }
  });
  return Template[templateName]
})
