_.forEach([
    {
      displayName: 'Worksite Address', lookUpActions: [Enums.lookUpAction.Address_WorksSite]
    },
    {
      displayName: 'Home', lookUpActions: [Enums.lookUpAction.Address_Home],
    },
    {
      displayName: 'Billing Address', lookUpActions: [Enums.lookUpAction.Address_Billing]
    },
    {
      displayName: 'Temporary', lookUpActions: [Enums.lookUpAction.Address_Temporary]
    }
  ],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.linkedAddress.type.lookUpCode;
    systemLookUps.push(item);
  }
);
