var selectedImage = new ReactiveVar(null);
var slectedFile = null;
var addDisabled = new ReactiveVar(false);
var processing = new ReactiveVar(false);
ScanEmployeeCardController = RouteController.extend({
  template: 'scanEmployeeCard'
});

var showServerProgress = new ReactiveVar(false);
Template.scanEmployeeCard.helpers({
  'imagepath':function(){
       return selectedImage.get();
  },
  'addDisabled': function(){
       return addDisabled.get();
  },
  'addHiden': function(){
    return selectedImage.get() ? "":"visibility: hidden";
  },
  'addHidenProcess': function(){
    return processing.get() ? "visibility: hidden":"";
  },
  'imageName': function(){
    return selectedImage.get() ? slectedFile.name : "";
  },
  showServerProgress: function () {
    return !progress.isStarted.get() && showServerProgress.get();
  }
})

Template.scanEmployeeCard.rendered = function (){
  selectedImage.set(null);
  slectedFile = null;
  addDisabled.set(false);
  processing.set(false);
}


Template.scanEmployeeCard.events({
  'change #capture': function(event, template){
    if (event.target.files && event.target.files[0]) {
      slectedFile = event.target.files[0];
      var reader = new FileReader();

      reader.onload = function (event) {
        selectedImage.set(event.target.result);
      };

      reader.readAsDataURL(event.target.files[0]);

    }

  },
  'click .add-trigger': function () {
    $('#capture').trigger('click');
  },
  'click .save-employee': function (e) {
    showServerProgress.set(true);
     //e.target.remove();
     uploadFile(slectedFile);
  }
});

var pollingCardReader = function(task, intervalBar, totalTime){
  Meteor.setTimeout(function(){
   Meteor.call('parseCardReader', task.id,function(err, cb){
      if(cb){
        if(cb === "Not completed yet") {
          totalBar = ((100-totalBar)/2);
          totalTime = totalTime + task.estimatedTime*1000;
          if(totalTime >30*1000){
            progress.end();
            Utils.showModal('basicModal', {
              title: 'Unable to parse',
              message: 'Unable to parse the selected image',
              callback: function () {
                processing.set(false);
              }
            });
          }
          pollingCardReader(task);
        }
        else {
          if(cb === "Unable to parse"){
            progress.end();
            Utils.showModal('basicModal', {
              title: 'Unable to parse',
              message: 'Unable to parse the selected image',
              callback: function () {
                processing.set(false);
              }
            });
          }
          else {
            Meteor.clearInterval(intervalBar);
            progress.end();
            processing.set(false)
            Router.go('/contactable/' + cb.content);
          }
        }
      }
      else if(err){
        console.log(err);
      }
    });
  },task.estimatedTime*1000);
};

var progress = {
  val: new ReactiveVar(null),
  isStarted:  new ReactiveVar(false),
  displayName: new ReactiveVar(""),
  start: function(){
    this.isStarted.set(true);
    this.val.set(0);
  },
  set: function(value){
    this.val.set(value);
  },
  get: function(){
    return this.val.get();
  },
  end: function(){
    this.isStarted.set(false);
    this.val.set(0);
  },
  isProcessing: function(){
    return this.isStarted.get();
  }
}
var totalBar;
var uploadFile = function (file) {
  processing.set(true);
  FileUploader.postProgress('uploadCard', file, progress, function (err, result) {
    showServerProgress.set(false);
    if(result){
       //var task = Router.go('/contactable/'+JSON.parse(result));
       var totalTime = 0;
       totalBar = 80;
       progress.start();
       progress.displayName = "Parsing...";
       progress.set(0);
       var intervalBar = Meteor.setInterval(function () {
          progress.set(progress.get() + ((500 * totalBar) / (JSON.parse(result).estimatedTime * 1000)));

       }, 500);
       pollingCardReader(JSON.parse(result), intervalBar, totalTime);

     }
    else if(err){
      console.log(err);
      Router.go('/');
    }
  });
};



Template.progressBarClient.helpers({
  prog: function () {
    return progress.get();
  },
  DisplayName: function(){
    return progress.displayName;
  },
  isDefined: function () {
    return progress.isStarted.get();
  }
});

Template.progressBarClient.created =function() {

}