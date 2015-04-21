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
  }
})

Template.scanEmployeeCard.events({
  'change #capture': function(event, template){
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = function (event) {
        selectedImage.set(event.target.result);
      };

      reader.readAsDataURL(event.target.files[0]);
      slectedFile = event.target.files[0];
    }

  },
  'click .add-trigger': function () {
    $('#capture').trigger('click');
  },
  'click .save-employee': function () {
     uploadFile(slectedFile);
  }
});

var uploadFile = function (file) {
  addDisabled.set(true);
  FileUploader.post('uploadCard', file, function (err, result) {

    if(result){
         Router.go('/contactable/'+JSON.parse(result.content));
         addDisabled.set(false)
     }
  });
};

