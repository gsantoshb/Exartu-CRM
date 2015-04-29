var selectedImage = new ReactiveVar(null);
var slectedFile = null;
var addDisabled = new ReactiveVar(false);
ScanEmployeeCardController = RouteController.extend({
  template: 'scanEmployeeCard'
});

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
  'imageName': function(){
    return selectedImage.get() ? slectedFile.name : "";
  }
})

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
     e.target.remove();
     uploadFile(slectedFile);
  }
});

var uploadFile = function (file) {
  addDisabled.set(true);
  FileUploader.postProgress('uploadCard', file, progress, function (err, result) {
    if(result){
        Router.go('/contactable/'+JSON.parse(result));
        addDisabled.set(false)
     }
    else if(err){
      debugger;
    }
  });
};

var progress = {
  val: new ReactiveVar(null),
  isStarted:  new ReactiveVar(false),
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

Template.progressBarClient.helpers({
  prog: function () {
    return progress.get();
  },
  isDefined: function () {
    return progress.isProcessing();
  }
});

Template.progressBarClient.created =function() {

}