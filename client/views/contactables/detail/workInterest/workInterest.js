var EditMode = new ReactiveVar(false);

Template.workInterest.helpers({
  contactable: function () {
    var toReturn = {};
    toReturn._id = this._id;
    if(this.Employee){
      toReturn.Employee = true;
      toReturn.hasTransportation = this.Employee.hasTransportation;
      toReturn.desiredPay = this.Employee.desiredPay;
      toReturn.dateAvailable = this.Employee.dateAvailable;
      if(this.Employee.availableStartDate){
        var avaiableStart = [];
        if(this.Employee.availableStartDate['0'] === true){
          avaiableStart.push("Sunday");
        } if(this.Employee.availableStartDate['1'] === true){
          avaiableStart.push("Monday");
        } if(this.Employee.availableStartDate['2'] === true){
          avaiableStart.push("Tuesday");
        } if(this.Employee.availableStartDate['3'] === true){
          avaiableStart.push("Wednesday");
        } if(this.Employee.availableStartDate['4'] === true){
          avaiableStart.push("Thursday");
        } if(this.Employee.availableStartDate['5'] === true){
          avaiableStart.push("Friday");
        } if(this.Employee.availableStartDate['6'] === true){
          avaiableStart.push("Saturday");
        }
        toReturn.availableStartDate = avaiableStart;
      }
      if(this.Employee.availableShifts){
        var avaiableSh = [];
        if(this.Employee.availableShifts['1'] === true){
          avaiableSh.push("1st shift");
        } if(this.Employee.availableShifts['2'] === true){
          avaiableSh.push("2nd shift");
        } if(this.Employee.availableShifts['3'] === true){
          avaiableSh.push("3rd shift");
        }
        toReturn.availableShifts = avaiableSh;
      }
      if(this.Employee.preferredWorkLocation) {
        toReturn.preferredWorkLocation = {};
        toReturn.preferredWorkLocation.street = this.Employee.preferredWorkLocation.address;
        toReturn.preferredWorkLocation.state = this.Employee.preferredWorkLocation.state;
        toReturn.preferredWorkLocation.city = this.Employee.preferredWorkLocation.city;
        toReturn.preferredWorkLocation.country = this.Employee.preferredWorkLocation.country;
        toReturn.preferredWorkLocation.lat = this.Employee.preferredWorkLocation.lat;
        toReturn.preferredWorkLocation.lng = this.Employee.preferredWorkLocation.lng;

      }
    }
    return toReturn;
  },
  editMode: function () {
    return EditMode.get();
  }
})

Template.workInterest.events({
  'click #edit-workInterest-method-mode': function () {
    if (EditMode.get()) {
      EditMode.set(false);
      //contactable.reset();
    }
    else
      EditMode.set(true);
  }
})

Template.workInterest.created = function() {

}


AutoForm.hooks({
  workInterestAutoform: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      Meteor.call('updateContactable',updateDoc,currentDoc._id, function(err, res){
        EditMode.set(false);
      })
      return false;
    }
  }
})