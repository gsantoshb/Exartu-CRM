_.forEach([
  {
    displayName: 'Note Activity', lookUpActions:[Enums.lookUpAction.LeaderBoardType_Activity]
  },
  {
    displayName: 'Contacts Acquired',lookUpActions:[Enums.lookUpAction.LeaderBoardType_Contacts]
  },
  {
    displayName: 'Deal Pipeline', lookUpActions:[Enums.lookUpAction.LeaderBoardType_Pipeline]
  }
],
  function (item) {
    item.lookUpCode = Enums.lookUpTypes.leaderBoard.type.lookUpCode;
    systemLookUps.push(item);
  }
);