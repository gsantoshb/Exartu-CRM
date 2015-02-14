_.forEach([
  {
    displayName: 'Activity', lookUpActions:[Enums.lookUpAction.LeaderBoardType_Activity]
  },
  {
    displayName: 'Contacts',lookUpActions:[Enums.lookUpAction.LeaderBoardType_Contacts]
  },
  {
    displayName: 'Pipeline', lookUpActions:[Enums.lookUpAction.LeaderBoardType_Pipeline]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.leaderBoard.type.lookUpCode;
    systemLookUps.push(item);
  }
);