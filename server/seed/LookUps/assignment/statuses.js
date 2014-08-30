_.forEach([
  {
    displayName: 'Assigned', lookUpActions:[Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Matchup_Assigned]
  },
  {
    displayName: 'Candidate', lookUpActions:[Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Matchup_Candidate],isDefault: true
  },
    {
      displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive]
    }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.matchup.status.lookUpCode;
    systemLookUps.push(item);
  }
);