_.forEach([
  {
    displayName: 'Invited',
    weight: 2,
  },
  {
    displayName: 'Recruited',
    weight: 3,
    dependencies: [0]
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.contactable.status.code;
    systemLookUps.push(item);
  }
);

//employee status
_.forEach([
  {
    displayName:  "Candidate"
  },
  {
    displayName: "Interview"
  },
  {
    displayName: "Offered"
  },
  {
    displayName: "Placed"
  },
  {
    displayName: "Refused"
  },
  {
    displayName: "Rejected"
  },
  {
    displayName: "NA"
  },{
    displayName: "Sendout"
  },
  {
    displayName: "Submitted"
  },
  {
    displayName: "WCandidate"
  },
  {
    displayName: "Accepted"
  },
  {
    displayName: "Extend"
  },
  {
    displayName: "Interview1"
  },
  {
    displayName: "Interview2"
  },
  {
    displayName: "Pending"
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.employee.recruiterStatus.code;
    systemLookUps.push(item);
  }
);