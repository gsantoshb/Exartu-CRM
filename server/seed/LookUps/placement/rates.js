_.forEach([
  {
    displayName: 'Regular', lookUpActions:[Enums.lookUpAction.Is_RegularTime],isDefault: true
  },
  {
    displayName: 'Salary', lookUpActions:[Enums.lookUpAction.Is_Salary]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.placement.rate.lookUpCode;
    systemLookUps.push(item);
  }
);