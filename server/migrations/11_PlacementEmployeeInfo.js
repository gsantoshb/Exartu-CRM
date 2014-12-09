Migrations.add({
  version: 11,
  up: function () {
    // Get the new contact methods
    var placementCursor =  Placements.find();
    if (placementCursor.count()){
      console.log('////////  migration 11 ////////');
      console.log('updating ' + placementCursor.count() + ' placements');
      placementCursor.forEach(function (placement) {
        if (placement.employee){
          var employee = Contactables.findOne(placement.employee);
          if (employee) {
            var employeeInfo = {
              firstName: employee.person.firstName,
              lastName: employee.person.lastName,
              middleName: employee.person.middleName
            };
            Placements.update({
              _id: placement._id
            }, {
              $set: {employeeInfo: employeeInfo}
            });
          } else {
            console.warn('placement ' + placement._id + ' not migrated because the employee doesn\'t exists');
          }
        } else{
          console.warn('placement ' + placement._id + ' not migrated because it doesn\'t have an employee');
        }
      })
    }
  }
});