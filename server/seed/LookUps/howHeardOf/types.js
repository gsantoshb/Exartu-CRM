_.forEach([
  {
    displayName: 'Referral', lookUpActions:[Enums.lookUpAction.HowHeardOf_Referral]
  },
  {
    displayName: 'Internet',lookUpActions:[Enums.lookUpAction.HowHeardOf_Internet]
  },
  {
    displayName: 'Other', lookUpActions:[Enums.lookUpAction.HowHeardOf_Other]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.howHeardOf.type.lookUpCode;
    systemLookUps.push(item);
  }
);