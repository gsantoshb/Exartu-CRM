
// Seed templates
seedEmailTemplates = function (hierId) {
  var emailTemplates = [{
    name: 'Interview appointment',
    subject: 'Interview appointment',
    text: 'Dear&nbsp;<input disabled="disabled" value="First Name" data-mergefield="employeeFirstName"><br><br>We are looking forward to meeting you for your interview on Monday. We ask that when you arrive you check in with the receptionist. Please plan for 90 minutes as several staff members will conduct the interview with you.Validated parking is available from in the parking garage adjacent to our office. Please bring your parking ticket with you and the receptionist will validate it. We have attached a non-disclosure agreement that you must read sign prior to beginning your interview.<br><br>Sincerely,<br>Aïda Team',
    category: MergeFieldHelper.categories.employee.value
  }];

  _.forEach(emailTemplates, function (data) {
    var newEmailTemplate = data;
    newEmailTemplate.dateCreated = Date.now();
    newEmailTemplate.hierId = hierId;
    EmailTemplateManager.createTemplate(data);
  });
};
