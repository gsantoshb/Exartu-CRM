_.forEach([
  {
		displayName: "Full-Time"
  },
  {
		displayName: "Part-Time"
  },
  {
		displayName: "Full-Time/Part-Time"
  },
  {
		displayName: "Contractor"
  },
  {
		displayName: "Intern"
  },
  {
		displayName: "Seasonal/Temp"
  },
  {
		displayName: "Per Diem"
  },
  {
		displayName: "Franchises"
  }

],
  function (item) {
item.codeType = Enums.lookUpTypes.job.duration.code;
systemLookUps.push(item);
  }
);