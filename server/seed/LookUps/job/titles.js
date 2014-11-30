_.forEach([
  {
    displayName: 'Developer'
  },
  {
    displayName: 'Designer'
  },
    {
      displayName: 'Auditor'
    },
    {
      displayName: 'Analyst'
    },
    {
      displayName: 'Untitled',lookUpActions:[Enums.lookUpAction.JobTitle_Untitled],isDefault: true
    },
    {
      displayName: 'Accountant'
    },
    {
      displayName: 'Administrator'
    },
    {
      displayName: 'Designer'
    },
    {
      displayName: 'Account Manager'
    },
    {
      displayName: 'CEO'
    },
    {
      displayName: 'CFO'
    },
    {
      displayName: 'COO'
    },
    {
      displayName: 'VP Sales'
    }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.job.titles.lookUpCode;
    systemLookUps.push(item);
  }
);