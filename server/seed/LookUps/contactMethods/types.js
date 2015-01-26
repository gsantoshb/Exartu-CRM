_.forEach([
    {
      displayName: 'Work', lookUpActions: [Enums.lookUpAction.ContactMethod_Phone,Enums.lookUpAction.ContactMethod_WorkPhone]
    },
    {
      displayName: 'Home', lookUpActions: [Enums.lookUpAction.ContactMethod_Phone,Enums.lookUpAction.ContactMethod_HomePhone]
    },
    {
      displayName: 'Mobile Phone', lookUpActions: [Enums.lookUpAction.ContactMethod_Phone,Enums.lookUpAction.ContactMethod_MobilePhone]
    },
    {
      displayName: 'Email', lookUpActions: [Enums.lookUpAction.ContactMethod_Email]
    },
    {
      displayName: 'Work Email', lookUpActions: [Enums.lookUpAction.ContactMethod_Email,Enums.lookUpAction.ContactMethod_WorkEmail]
    },
    {
      displayName: 'Personal Email', lookUpActions: [Enums.lookUpAction.ContactMethod_Email,Enums.lookUpAction.ContactMethod_PersonalEmail]
    },
        {
            displayName: 'LinkedIn', lookUpActions: []
        },
        {
            displayName: 'Facebook', lookUpActions: []
        },
        {
            displayName: 'Twitter', lookUpActions: []
        }
  ],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.contactMethod.type.lookUpCode;
    systemLookUps.push(item);
  }
);
