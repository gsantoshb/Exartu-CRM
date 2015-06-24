// Common data
var tags = [
    ['sales', 'innovator'], ['javascript', 'css', 'oodb', 'sql', 'linux'], ['accounting', 'bookkeeping', 'cpa', 'auditing']

];
var contacts = [
    {
        lastName: "Doe",
        firstName: "Samantha"
    },
    {
        lastName: "Reagan",
        firstName: "John"
    },
    {
        lastName: "Ryan",
        firstName: "Darcy"
    },
    {
        lastName: "Campos",
        firstName: "Jeff"
    },
    {
        lastName: "Belton",
        firstName: "Joseph"
    },
    {
        lastName: "Sotono",
        firstName: "Reggie"
    },
    {
        lastName: "Columbo",
        firstName: "Jeff"
    },
    {
        lastName: "Bond",
        firstName: "James"
    },
    {
        lastName: "Cameron",
        firstName: "Sandy"
    },
    {
        lastName: "Velotos",
        firstName: "Remie"
    }
];
var employees = [
    {
        lastName: "Eagleton",
        firstName: "Andrew"
    },
    {
        lastName: "Gate",
        firstName: "John"
    },
    {
        lastName: "Smith",
        firstName: "John"
    },
    {
        lastName: "Ruffington",
        firstName: "Wilson"
    },
    {
        lastName: "Berneche",
        firstName: "Joe"
    },
    {
        lastName: "Soto",
        firstName: "Roger"
    },
    {
        lastName: "Schrute",
        firstName: "Anna"
    },
    {
        lastName: "Pankerton",
        firstName: "Johnny"
    },
    {
        lastName: "Pasarini",
        firstName: "Fernando"
    },
    {
        lastName: "Campos",
        firstName: "Jeffrey"
    },
    {
        lastName: "Climer",
        firstName: "Rae"
    },
    {
        lastName: "Lewis",
        firstName: "James"
    },
    {
        lastName: "Love",
        firstName: "Jeff"
    },
    {
        lastName: "Jones",
        firstName: "Debbie"
    },
    {
        lastName: "Barbeau",
        firstName: "Adrian"
    },
    {
        lastName: "Pasarini",
        firstName: "Vito"
    },
    {
        lastName: "Lee",
        firstName: "Nestor"
    },
    {
        lastName: "McKee",
        firstName: "Geoffrey"
    },
    {
        lastName: "Pennington",
        firstName: "Charlene"
    },
    {
        lastName: "Wayne",
        firstName: "John"
    },
    {
        lastName: "Norris",
        firstName: "Aram"
    },
    {
        lastName: "Bean",
        firstName: "Mark"
    },
    {
        lastName: "Cossey",
        firstName: "Michael"
    },
    {
        lastName: "Edwards",
        firstName: "Robert"
    },
    {
        lastName: "Fox",
        firstName: "William"
    },
    {
        lastName: "Crosby",
        firstName: "Howard"
    },
    {
        lastName: "Small",
        firstName: "Jeff"
    },
    {
        lastName: "Whitson",
        firstName: "Charles"
    },
    {
        lastName: "Hart",
        firstName: "Pamela"
    },
    {
        lastName: "Cossey",
        firstName: "Zoe"
    }
];


// 57 Clients
var clients = [
    {
        "name": "Yahoo",
        "department": "Shipping"
    },
    {
        "name": "Coke",
        "department": "Primary"
    },
    {
        "name": "3M",
        "department": "Primary"
    },
    {
        "name": "Cargill",
        "department": "Primary"
    },
    {
        "name": "General Electric",
        "department": "Primary"
    },
    {
        "name": "Kraft Foods",
        "department": "Primary"
    },
    {
        "name": "Godiva Chocolates",
        "department": "Primary"
    },
    {
        "name": "Microsoft",
        "department": "Primary"
    },
    {
        "name": "ABC Corporation",
        "department": "Shipping"
    },
    {
        "name": "Aldi Inc",
        "department": "Tap Room"
    },
    {
        "name": "Ames Construction, Inc.",
        "department": "Primary"
    },
    {
        "name": "Aquafina",
        "department": "Primary"
    },


    {
        "name": "Best Buy",
        "department": "Store #456"
    },
    {
        "name": "Birkshire Lighting",
        "department": "Warehouse"
    },
    {
        "name": "CompUSA",
        "department": "Primary"
    },


    {
        "name": "Elephant Industries Inc.",
        "department": "Human Resources"
    },
    {
        "name": "Flavor Splash",
        "department": "MIsc"
    },
    {
        "name": "Green Thumb",
        "department": "Warehouse"
    },
    {
        "name": "Green Thumb",
        "department": "Primary"
    },
    {
        "name": "Harper Designs",
        "department": "Warehouse"
    },
    {
        "name": "Mel's Tree Service",
        "department": "Primary"
    },
    {
        "name": "Midwest Wireless",
        "department": "Accounting"
    },
    {
        "name": "Midwest Wireless",
        "department": "Primary"
    },
    {
        "name": "Ohio Health",
        "department": "Warehouse"
    },
    {
        "name": "Pencil Designs Inc",
        "department": "Metal Bands"
    },

    {
        "name": "Uniform Snow Inc",
        "department": "Warehouse"
    },
    {
        "name": "Warcraft Players Association",
        "department": "Primary"
    },
    {
        "name": "Whiting and Associates",
        "department": "Primary"
    },


    {
        "name": "Best Buy",
        "department": "Primary"
    },
    {
        "name": "Cleaning inc",
        "department": "Primary"
    },
    {
        "name": "David's Bridal",
        "department": "Primary"
    },
    {
        "name": "Global Technologies, Inc",
        "department": "Primary"
    },
    {
        "name": "Global Technologies, Inc.",
        "department": "Packline"
    },

    {
        "name": "Largo Boats",
        "department": "Primary"
    },


    {
        "name": "Stanley Tools",
        "department": "Primary"
    },
    {
        "name": "Stanley Tools",
        "department": "Primary"
    },
    {
        "name": "Stanley Tools",
        "department": "Primary"
    },
    {
        "name": "Talbots",
        "department": "Primary"
    },
    {
        "name": "Vandy Enterprises",
        "department": "Primary"
    },
    {
        "name": "Walmart",
        "department": "Primary"
    },
    {
        "name": "XYZ Corp",
        "department": "Primary"
    }
];
var randomTag = tags[Math.floor(Math.random() * tags.length)];

var loadContactables = function (hierId) {
    // Employees
    _.forEach(employees, function (data) {

        var status = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode,
            isDefault: true,
            hierId: hierId
        });
        if (status == null) LookUps.findOne({lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode, hierId: hierId});
        if (status == null) console.log("unable to find default status code for employee");

        var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode, hierId: hierId}).fetch();
        var randomJobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        var emailValue = data.firstName + '.' + data.lastName + '@gmail.com';
        var mobileValue = '1-651-555-' + (Math.floor(Math.random() * 9999999)).toString().substring(2, 6);
        var contactMethods = [];
        if (emailContactMethod) contactMethods.push({'type': emailContactMethod._id, 'value': emailValue});
        if (mobileContactMethod) contactMethods.push({'type': mobileContactMethod._id, 'value': mobileValue});

        var newEmployee = {
            Employee: {
                description: "top candidate",
                status: status ? status._id : null
            },
            tags: randomTag,
            contactMethods: contactMethods,
            statusNote: 'looks to be making a decision soon',
            objNameArray: ["person", "Employee", "contactable"],
            person: {
                firstName: data.firstName,
                middleName: "",
                lastName: data.lastName,
                jobTitle: randomJobTitle.displayName,
                salutation: ""
            },
            hierId: hierId,
            testData: true
        };

        ContactableManager.create(newEmployee);
    });
    var mobileContactMethod = LookUpManager.ContactMethodTypes_MobilePhone();
    var emailContactMethod = LookUpManager.ContactMethodTypes_Email();

    // Clients
    _.forEach(clients, function (data) {

        var status = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.client.status.lookUpCode,
            isDefault: true,
            hierId: hierId
        });
        if (status == null) LookUps.findOne({lookUpCode: Enums.lookUpTypes.client.status.lookUpCode, hierId: hierId});
        if (status == null) console.log("unable to find default status code for client");
        var emailValue = 'sales@' + data.name + '.com';
        var mobileValue = '1-651-555-' + (Math.floor(Math.random() * 9999999)).toString().substring(2, 6);
        var contactMethods = [];
        if (emailContactMethod) contactMethods.push({'type': emailContactMethod._id, 'value': emailValue});
        if (mobileContactMethod) contactMethods.push({'type': mobileContactMethod._id, 'value': mobileValue});
        var newClient = {
            Client: {
                department: data.department,
                status: status ? status._id : null
            },
            tags: randomTag,
            contactMethods: contactMethods,
            statusNote: 'looks to be making a decision soon',
            objNameArray: ["organization", "Client", "contactable"],
            organization: {
                organizationName: data.name
            },
            hierId: hierId,
            testData: true
        };

        ContactableManager.create(newClient);
    });

    _.forEach(contacts, function (data) {

        var status = LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode,
            isDefault: true,
            hierId: hierId
        });
        if (status == null) LookUps.findOne({lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode, hierId: hierId});
        if (status == null) console.log("unable to find default status code for contact");

        var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode, hierId: hierId}).fetch();
        var randomJobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        var clients = Contactables.find({objNameArray: 'Client', hierId: hierId}).fetch();
        var randomClient = clients[Math.floor(Math.random() * clients.length)];
        var emailValue = data.firstName + '.' + data.lastName + '@gmail.com';
        var mobileValue = '1-651-555-' + (Math.floor(Math.random() * 9999999)).toString().substring(2, 6);
        var contactMethods = [];
        if (emailContactMethod) contactMethods.push({'type': emailContactMethod._id, 'value': emailValue});
        if (mobileContactMethod) contactMethods.push({'type': mobileContactMethod._id, 'value': mobileValue});
        var newContact = {
            Contact: {
                description: "buying influence",
                status: status ? status._id : null,
                client: randomClient._id
            },
            tags: randomTag,
            contactMethods: contactMethods,
            statusNote: 'looks to be making a decision soon',
            objNameArray: ["person", "Contact", "contactable"],
            person: {
                firstName: data.firstName,
                middleName: "",
                lastName: data.lastName,
                jobTitle: randomJobTitle.displayName,
                salutation: ""
            },
            hierId: hierId,
            testData: true
        };

        ContactableManager.create(newContact);
    });
    console.log("Contactable demo data created", Date.now());
};

var loadJobs = function (hierId) {
    var clients = Contactables.find({objNameArray: 'Client', hierId: hierId}).fetch();
    var jobTypes = dType.ObjTypes.find({parent: 'job'}).fetch()
    var industries = LookUps.find({lookUpCode: Enums.lookUpTypes.job.industry.lookUpCode, hierId: hierId}).fetch();
    var categories = LookUps.find({lookUpCode: Enums.lookUpTypes.job.category.lookUpCode, hierId: hierId}).fetch();
    var durations = LookUps.find({lookUpCode: Enums.lookUpTypes.job.duration.lookUpCode, hierId: hierId}).fetch();
    var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode, hierId: hierId}).fetch();
    var status = LookUps.findOne({
        lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,
        isDefault: true,
        hierId: hierId
    });

    for (var i = 0; i < 25; ++i) {

        var randomJobType = 'Temporary'; //jobTypes[Math.floor(Math.random() * jobTypes.length)];
        var randomClient = clients[Math.floor(Math.random() * clients.length)];
        var randomJobTitle = jobTitles [Math.floor(Math.random() * jobTitles.length)];
        var newJob = {
            tags: randomTag,
            client: randomClient._id,
            Temporary: {},
            objNameArray: ['job', 'Temporary'],
            hierId: hierId,
            industry: industries[Math.floor(Math.random() * industries.length)]._id,
            category: categories[Math.floor(Math.random() * categories.length)]._id,
            duration: durations[Math.floor(Math.random() * durations.length)]._id,
            status: status._id,
            publicJobTitle: randomJobTitle.displayName,
            jobTitle: randomJobTitle._id,
            statusNote: 'looks to be making a decision soon',
            description: "a job for all times",
            testData: true
        }

        Meteor.call('addJob', newJob, function (err, result) {
            if (err)
                console.log(err);
        })
    }
    ;
    console.log("Job demo data created", Date.now());
};


var loadPlacements = function (hierId) {
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    var jobs = Jobs.find({hierId: hierId}).fetch();

    var employees = Contactables.find({objNameArray: 'Employee', hierId: hierId}).fetch();
    var candidateStatuses = LookUps.find({
        lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode,
        hierId: hierId
    }).fetch();
    var rateType = LookUps.findOne({lookUpCode: Enums.lookUpTypes.placement.rate.lookUpCode, hierId: hierId});
    for (var i = 0; i < 10; ++i) {
        var randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        var randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        var newPlacement = {
            tags: [],
            job: randomJob._id,
            objNameArray: ["placement"],
            employee: randomEmployee._id,
            candidateStatus: candidateStatuses[Math.floor(Math.random() * candidateStatuses.length)]._id,
            hierId: hierId,
            startDate: today,
            endDate: tomorrow,
            statusNote: 'excited about the job',
            "placementRates": [{
                "type": rateType._id,
                "pay": "15.00",
                "bill": "25.00"
            }],
            testData: true
        }
        // TODO: check objType's fields

        Meteor.call('addPlacement', newPlacement, function (err, result) {
            if (!err)
                console.log("Placement created for demo")
            else
                console.log(err);
        })
    }
    ;
    console.log("Placement demo data created", Date.now());
};
var loadHotLists = function (hierId) {
    var employees = Contactables.find({objNameArray: 'Employee', hierId: hierId}).fetch();
    var members = [];
    for (var i = 0; i < 10; ++i) {
        var randomEmployee = employees[Math.floor(Math.random() * employees.length)];
        members.push(randomEmployee._id);
    }
    members = _.uniq(members);

    var newHotList = {
        displayName: 'Hotlist Example',
        category: MergeFieldHelper.categories.employee.value,
        statusNote: 'Demo Hotlist: employees ready to send out',
        testData: true,
        members: members
    };

    try {
        HotListManager.addHotList(newHotList);
        console.log("HotList created for demo");
    } catch (err) {
        console.log(err);
    }

    console.log("HotList demo data created", Date.now());
};


var loadTasks = function (hierId, usermane, userId) {
    var employeesFetched = Contactables.find({objNameArray: 'Employee', hierId: hierId}).fetch();
    var contactsFetched = Contactables.find({objNameArray: 'Contact', hierId: hierId}).fetch();
    var notes = [
        "Call ",
        "confirm details with",
        "check on progress with",
        "Discuss offer with",
        "Reconfirm appt with",
        "Interview prep with"

    ];

    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    for (var i = 0; i < 100; ++i) {
        var randomDate = new Date(''+(Math.floor(Math.random()*(12-1))+1)+'/'+(Math.floor(Math.random()*(28-1))+1)+'/2015');

        var person = employeesFetched[Math.floor(Math.random() * employeesFetched.length)];
        if (i % 2 == 0) person = contactsFetched[Math.floor(Math.random() * contactsFetched.length)];
        var msg = notes[Math.floor(Math.random() * notes.length)] + ' ' + person.person.firstName;
        var newTask = {
            begin: randomDate,
            end: randomDate,
            assign: userId, //[userIds[Math.floor(Math.random() * userIds.length)]],
            msg: msg,
            completed: null,
            hierId: hierId,
            userId: userId,
            testData: true,
            links: [{id: person._id, type: Enums.linkTypes.contactable.value}]
        }

        Tasks.insert(newTask, function (err, result) {
            if (err)
                console.log(err);
        })
    }
    console.log("Task demo data created", Date.now());
};
var loadNotes = function (hierId, usermane, userId) {
    var employeesFetched = Contactables.find({objNameArray: 'Employee', hierId: hierId}).fetch();
    var contactsFetched = Contactables.find({objNameArray: 'Contact', hierId: hierId}).fetch();
    var notes = [
        "Called ",
        "Contacted ",
        "Confirmed ",
        "Scheduled interview w/ "
    ];


    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    for (var i = 0; i < 25; ++i) {
        var person = employeesFetched[Math.floor(Math.random() * employeesFetched.length)];
        if (i % 2 == 0) person = contactsFetched[Math.floor(Math.random() * contactsFetched.length)];
        var msg = notes[Math.floor(Math.random() * notes.length)] + ' ' + person.person.firstName;
        var newNote = {
            msg: msg,
            hierId: hierId,
            userId: userId,
            testData: true,
            links: [{id: person._id, type: Enums.linkTypes.contactable.value}]
        }
      Meteor.call('addNote', newNote, function () {
      })

    }
    console.log("Note demo data created", Date.now());
};

// For testing
Meteor.methods({
    loadDemoData: function () {
        var user = Meteor.user();
        if (!user)
            return;

        var progress = ServerProgress.start(Meteor.userId(), 'injectData');
        var userCurrentHierId = Utils.getUserHierId(user._id);

        progress.set(5);
        loadContactables(userCurrentHierId);
        progress.set(30);
        loadJobs(userCurrentHierId);
        progress.set(40);
        loadPlacements(userCurrentHierId);
        progress.set(60);
        loadHotLists(userCurrentHierId);
        progress.set(65);
        loadTasks(userCurrentHierId, user.username, user._id);
        progress.set(80);
        loadNotes(userCurrentHierId, user.username, user._id);
        progress.set(100);
        progress.end();
    },
    removeDemoData: function () {
        var user = Meteor.user();
        var userCurrentHierId = Utils.getUserHierId(user._id);
        if (!user)
            return;
        _.each([HotLists,Contactables, Jobs, Tasks, Placements, Notes, Activities], function (collection) {
            collection.direct.remove({hierId: userCurrentHierId, testData: true});
        });
    }
});