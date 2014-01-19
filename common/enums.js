Enums = {};
_.extend(Enums, {
    fieldType: {
        string: 0,
        int: 1,
        date: 2,
        select: 3,
        checkbox: 4,
    },
    activitiesType: {
        contactableAdd: 0,
        messageAdd: 1
    }
});

Global = {};
_.extend(Global, {
    person: {
        firstName: '',
        lastName: '',
        middleName: '',
        salutation: '',
        jobTitle: '',
        salutation: '',
    },
    organization: {
        organizationName: '',
    }
});