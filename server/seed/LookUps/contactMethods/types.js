_.forEach([
    {
      displayName: 'Land Line', lookUpActions: [Enums.lookUpAction.ContactMethod_Phone]
    },
    {
      displayName: 'Cell Phone', lookUpActions: [Enums.lookUpAction.ContactMethod_Phone,Enums.lookUpAction.ContactMethod_CellPhone]
    },
    {
      displayName: 'Email', lookUpActions: [Enums.lookUpAction.ContactMethod_Email]
    },
    {
      displayName: 'Other'
    }
  ],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.contactMethod.type.lookUpCode;
    systemLookUps.push(item);
  }
);
