
Placements.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  } catch (e) {
    //when the insert is trigger from the server
    var user = {}
  }

  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();
  if (!doc.activeStatus) doc.activeStatus = LookUpManager.getActiveStatusDefaultId();
  if (doc.job) {
    var job = Jobs.findOne(doc.job);
    if (job) doc.jobDisplayName = job.displayName;
  }
  if (doc.employee) {
    var emp = Contactables.findOne(doc.employee);
    if (emp) doc.employeeDisplayName = emp.displayName;
  }
  doc.displayName = doc.employeeDisplayName + ' ' + doc.jobDisplayName;
});

// add some employee fields for placement sorting
Placements.before.insert(function (userId, doc) {
  var employee = doc.employee && Contactables.findOne(doc.employee);
  if (employee) {
    doc.employeeInfo = {
      firstName: employee.person.firstName,
      lastName: employee.person.lastName,
      middleName: employee.person.middleName
    }
  }
});