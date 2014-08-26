_.forEach([
  {
    displayName: 'Active', lookUpActions:[Enums.lookUpAction.Implies_Active],isDefault: true
  },
  {
    displayName: 'Submittal',lookUpActions:[Enums.lookUpAction.Candidate_Submittal,Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Sendout', lookUpActions:[Enums.lookUpAction.Candidate_Sendout,Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Placed', lookUpActions:[Enums.lookUpAction.Candidate_Placed,Enums.lookUpAction.Implies_Active]
  },
  {
    displayName: 'Inactive', lookUpActions:[Enums.lookUpAction.Implies_Inactive]
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.candidate.status.code;
    systemLookUps.push(item);
  }
);