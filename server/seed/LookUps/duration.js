systemLookUps=systemLookUps||[];
systemLookUps.push({
    name: 'jobDuration',
    objGroupType: Enums.objGroupType.job,
    items: [
        {
            code: "JTFT",
            displayName: "Full-Time"
        },
        {
            code: "JTPT",
            displayName: "Part-Time"
        },
        {
            code: "JTFP",
            displayName: "Full-Time/Part-Time"
        },
        {
            code: "JTCT",
            displayName: "Contractor"
        },
        {
            code: "JTIN",
            displayName: "Intern"
        },
        {
            code: "JTSE",
            displayName: "Seasonal/Temp"
        },
        {
            code: "JTPD",
            displayName: "Per Diem"
        },
        {
            code: "JTFR",
            displayName: "Franchises"
        }

    ]
});