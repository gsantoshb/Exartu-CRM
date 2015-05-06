var selectedFiles = [];
var selectedFilesDep = new Deps.Dependency();
var selectedImage = new ReactiveVar(null);
var slectedFile = null;
var addDisabled = new ReactiveVar(false);

ScanEmployeeCardController = RouteController.extend({
  template: 'scanEmployeeCard'
});

var showServerProgress = new ReactiveVar(false);
Template.scanEmployeeCard.helpers({
  imagesList: function(){
    selectedFilesDep.depend();
    return selectedFiles;
  },
  notEmptyList: function(){
    selectedFilesDep.depend();
    return selectedFiles.length > 0;
  }
})

Template.scanEmployeeCard.rendered = function (){
  selectedImage.set(null);
  slectedFile = null;
  addDisabled.set(false);

}


Template.scanEmployeeCard.events({
  'change #capture': function(event, template){
    if (event.target.files && event.target.files[0]) {
        slectedFile = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
          selectedImage.set(event.target.result);
          if(!_.contains(_.pluck(selectedFiles, "name"), slectedFile.name)){
            selectedFiles.push(_.extend(slectedFile,{imageSource: event.target.result} ));
            selectedFilesDep.changed();
          };
        };
        reader.readAsDataURL(event.target.files[0]);
        fromTakePhoto = false;
    }
  },
  'click .add-trigger': function () {
    fromTakePhoto = true;
    $('#capture').trigger('click');
  },
  'click .process-all': function() {
    var allProcess = $('.save-employee');
    _.each(allProcess, function(p){
      if(!(p.style.display === "none")) {
        p.click();
      }
    });

  }

});



var pollingCardReader = function(task, intervalBar, totalTime, progress, processing, id, error, success){
  Meteor.setTimeout(function(){
   Meteor.call('parseCardReader', task.id,function(err, cb){
      if(cb){
        if(cb === "Not completed yet") {
          totalBar = ((100-totalBar)/2);
          totalTime = totalTime + task.estimatedTime*1000;
          if(totalTime >30*1000){
            progress.end();
            processing.set(false);
            error.set(true);
          }
          else {
            pollingCardReader(task, intervalBar, totalTime, progress, processing, id, error, success);
          }
        }
        else {
          if(cb === "Unable to parse"){
            progress.end();
            processing.set(false);
            error.set(true);
          }
          else {
            Meteor.clearInterval(intervalBar);
            progress.end();
            processing.set(false);
            error.set(false);
            success.set(cb.content);
            //Router.go('/contactable/' + cb.content);
          }
        }
      }
      else if(err){
        console.log(err);
      }
    });
  },task.estimatedTime*1000);
};

function progress () {
  this.val = new ReactiveVar(null);
  this.isStarted =  new ReactiveVar(false);
  this.displayName = new ReactiveVar("");
  this.start = function(){
    this.isStarted.set(true);
    this.val.set(0);
  };
  this.set = function(value){
    this.val.set(value);
  };
  this.get = function(){
    return this.val.get();
  };
  this.end = function(){
    this.isStarted.set(false);
    this.val.set(0);
  };
  this.isProcessing = function(){
    return this.isStarted.get();
  }

}

var totalBar;
var uploadFile = function (file) {
  var prog = file.progress;
  var processing = file.processing;
  var id = file.id;
  var error = file.error;
  var success = file.success;
  processing.set(true);
  FileUploader.postProgress('uploadCard', file, prog, function (err, result) {
    showServerProgress.set(false);
    if(result){
       //var task = Router.go('/contactable/'+JSON.parse(result));
       var totalTime = 0;
       totalBar = 80;
       prog.start();
       prog.displayName = "Parsing...";
       prog.set(0);
       var intervalBar = Meteor.setInterval(function () {
         var newProgress = prog.get() + ((500 * totalBar) / (JSON.parse(result).estimatedTime * 1000));
         if(newProgress < 100) {
           prog.set(newProgress);
         }
         else{
           prog.set(100);
         }

       }, 500);
       pollingCardReader(JSON.parse(result), intervalBar, totalTime, prog, processing, id, error, success);

     }
    else if(err){
      console.log(err);
      Router.go('/');
    }
  });
};

Template.scanEmployeeBox.helpers({
  showServerProgress: function () {
    return !this.progress.isStarted.get() && showServerProgress.get();
  },
  prog: function () {
    return this.progress.get();
  },
  displayName: function(){
    return this.progress.displayName;
  },
  addHidenProcess: function(){
    if(this.processing.get()||(this.success.get()!="")){
      return "display: none";
    }
    else if(this.error.get()){
      return "display: none";
    }
    else{
      return "";
    }
  },
  isProcessing: function () {
    return this.progress.isStarted.get();
  },
  dataId: function(){
    return 'processCard_'+this.id;
  },
  errorParsingId: function(){
    return 'error-parsing-'+this.id;
  },
  addHidenChange: function(){
    return (this.processing.get()||this.success.get()!="") ? "display: none":"";
  },
  addHidenRemove: function(){
    return (this.processing.get()) ? "display: none":"";
  },
  error: function(){
    return this.error.get();
  },
  success: function(){
    return this.success.get()!="";
  },
  employeeUrl: function(){
    return "/contactable/"+ this.success.get();
  },
  Id: function(){
    return this.id;
  }
})



Template.scanEmployeeBox.created= function(){
 this.init = function(){
   var prog = new progress();
   this.data.progress = prog;
   this.data.processing = new ReactiveVar(false);
   this.data.id = Random.id();
   this.data.error = new ReactiveVar(false);
   this.data.success = new ReactiveVar("");
 }
 this.init();
}

Template.scanEmployeeBox.events({
  'click .save-employee': function (e) {
    showServerProgress.set(true);
    uploadFile(this);
  },
  'click .close-photo': function(e){
    var self = this;
    selectedFiles = _.filter(selectedFiles, function(s){return self.name!== s.name });
    selectedFilesDep.changed();
    $('#capture')[0].value = "";
  },
  'click .change-photo': function(e, ctx){

    $('.change_'+this.id).trigger('click');

  },
  'change #change': function(event, template){
    if (event.target.files && event.target.files[0]){
        var position = _.indexOf(_.pluck(selectedFiles, "name"), template.data.name );
        slectedFile = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
          selectedImage.set(event.target.result);
          if(!_.contains(_.pluck(selectedFiles, "name"), slectedFile.name)){
            var prog = new progress();
            var processing = new ReactiveVar(false);
            var id = Random.id();
            var error = new ReactiveVar(false);
            var success = new ReactiveVar("");
            selectedFiles[position] = _.extend(slectedFile,{imageSource: event.target.result,
                                                            progress: prog,
                                                            processing: processing,
                                                            id: id,
                                                            error: error,
                                                            success: success} );
            template.data.success.set("");
            selectedFilesDep.changed();
          };
        };
        reader.readAsDataURL(event.target.files[0]);

      }
    }
})

