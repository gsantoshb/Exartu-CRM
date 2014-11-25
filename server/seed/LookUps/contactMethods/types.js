_.forEach([
    {
      displayName: 'Phone', lookUpActions: [Enums.lookUpAction.ContactMethod_Phone]
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
