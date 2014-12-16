// Seed templates after mergeFields

seedEmailTemplates = function(hierId) {
  var emailTemplates= [{
      category: ['employee'],
      name: 'Interview appointment',
      text: 'Dear&nbsp;<input value="Employee.firstName" data-mergefield=' + getMergeFieldIdByName('employeeFirstName') + 'disabled="disabled" style="text-align: center;border-radius: 2px; border: solid 1px #007AFF; color: #007AFF;"><br><br>We are looking forward to meeting you for your interview on Monday. &nbsp; We ask that when you arrive you check in with the receptionist. &nbsp;Please plan for 90 minutes as several staff members will conduct the interview with you.Validated parking is available from in the parking garage adjacent to our office. &nbsp; Please bring your parking ticket with you and the receptionist will validate it.We have attached a non-disclosure agreement that you must read sign prior to beginning your interview.Sincerely "userId: "dcb932d1-18e6-4665-a4a1-1c3e3fab90f4'
    }
  ];

  _.forEach(emailTemplates, function (data) {
    var newEmailTemplate=data;
    newEmailTemplate.dateCreated = Date.now();
    newEmailTemplate.hierId=hierId;
    EmailTemplateManager.createTemplate(data);
  });
};

var getMergeFieldIdByName = function (mergeFieldName) {
  var mergeField = EmailTemplateMergeFields.findOne({name: mergeFieldName});
  return mergeField && mergeField._id;
};