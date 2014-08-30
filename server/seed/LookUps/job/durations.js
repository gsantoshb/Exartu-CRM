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
item.lookUpCode = Enums.lookUpTypes.job.duration.lookUpCode;
systemLookUps.push(item);
  }
);