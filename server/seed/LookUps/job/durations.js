_.forEach([
        {
            displayName: "Full-Time"
        },
        {
            displayName: "Part-Time"
        },
        {
            displayName: "Temporary"
        },
        {
            displayName: "Per Diem"
        },
        {
            displayName: "Temp-to-Perm"
        }

],
  function (item) {
item.codeType = Enums.lookUpTypes.job.duration.code;
systemLookUps.push(item);
  }
);