// Common data
var employees = [
    {
        firstName: "Doe",
        lastName: "Andrew"},
    {
        firstName: "Gate",
        lastName: "John"
    },
    {
        firstName: "Smith",
        lastName: "John"
    },
    {
        firstName: "Campos",
        lastName: "Wilson"
    },
    {
        firstName: "Berneche", lastName: "Joe"
    },
    {
        firstName: "Soto",
        lastName: "Roger"
    },
    {
        firstName: "Schrute",
        lastName: "Anna"
    },
    {
        firstName: "Paycardguy",
        lastName: "Johnny"
    },
    {
        firstName: "Pasarini",
        lastName: "Fernando"
    },
    {
        firstName: "Campos",
        lastName: "Epay"
    },
    {
        firstName: "Climer",
        lastName: "Rae"
    },
    {
        firstName: "Lewis",
        lastName: "James"
    },
    {
        firstName: "InstantPay",
        lastName: "Jeff"
    },
    {
        firstName: "Cardtest",
        lastName: "EJpay"
    },
    {
        firstName: "Hanna",
        lastName: "Randy"
    },
    {
        firstName: "Pasarini",
        lastName: "Epay"
    },
    {
        firstName: "Lee",
        lastName: "Nestor"
    },
    {
        firstName: "McKee",
        lastName: "Geoffrey"
    },
    {
        firstName: "Pennington",
        lastName: "Charlene"
    },
    {
        firstName: "Wayne",
        lastName: "John"
    },
    {
        firstName: "Norris",
        lastName: "Aram"
    },
    {
        firstName: "Bean",
        lastName: "Mark"
    },
    {
        firstName: "Cossey",
        lastName: "Michael"
    },
    {
        firstName: "Edwards",
        lastName: "Robert"
    },
    {
        firstName: "Fox",
        lastName: "William"
    },
    {
        firstName: "Crosby",
        lastName: "Howard"
    },
    {
        firstName: "Small",
        lastName: "Jeff"
    },
    {
        firstName: "Whitson",
        lastName: "Charles"
    },
    {
        firstName: "Hart",
        lastName: "Pamela"
    },
    {
        firstName: "Cossey",
        lastName: "Zoe"
    },
]

var loadContactables = function (hierId) {
    // Employees
    _.forEach(employees, function (data) {
      var status=LookUps.findOne({lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode,isDefault:true,hierId:hierId});
      if (status==null) LookUps.findOne({lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode,hierId:hierId});
      if (status==null) console.log("unable to find default status code for customer")
        var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode,hierId:hierId}).fetch();

        var randomJobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        var newEmployee = {
            objNameArray: ["Employee"],
            person: {
                firstName: data.firstName,
                middleName: '',
                lastName: data.lastName,
                jobTitle: randomJobTitle.displayName,
                salutation: ''
            },
            Employee: {
                description: "test"
            },
            location: null,
            hierId: hierId,
            testData: true
        }

        Meteor.call('addContactable', newEmployee, function (err, result) {
            if (!err)
                console.log("Employee created for demo")
            else
                console.log(err);
        })
    });

    // Customers
    var customers = [
        {
            "name": "Yahoo",
            "department": "Shipping"
        },
        {
            "name": "ABC Corporation",
            "department": "Shipping"
        },
        {
            "name": "Action Staffing Solutions",
            "department": "Primary"
        },
        {
            "name": "Seintco",
            "department": "Labor Dispatch 1"
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
            "name": "Atlanta Staffing Source Inc",
            "department": "Sourcing"
        },
        {
            "name": "ATS Staffing",
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
            "name": "compusa",
            "department": "Primary"
        },
        {
            "name": "Crom Equipment",
            "department": "Taxes"
        },
        {
            "name": "Crom Equipment",
            "department": "Warehouse"
        },
        {
            "name": "Crom Equipment",
            "department": "North Warehouse"
        },
        {
            "name": "Crom Equipment",
            "department": "Primary"
        },
        {
            "name": "Crom Equipment",
            "department": "Warehouse"
        },
        {
            "name": "Crom Equipment",
            "department": "Shipping"
        },
        {
            "name": "Dees Diner",
            "department": "Payroll"
        },
        {
            "name": "Dover Staffing",
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
            "department": "Accountign"
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
            "name": "Prestige Staffing",
            "department": "Primary"
        },
        {
            "name": "Sales Tax Test",
            "department": "Primary"
        },
        {
            "name": "Stoerzinger Supply Co",
            "department": "Warehouse"
        },
        {
            "name": "Test Jeff Customer",
            "department": "Primary"
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
            "name": "Google",
            "department": "Primary"
        },
        {
            "name": "atlas staffing",
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
            "name": "Jon",
            "department": "Primary"
        },
        {
            "name": "Largo Boats",
            "department": "Primary"
        },
        {
            "name": "Mari's Company",
            "department": "Primary"
        },
        {
            "name": "Mari's Company",
            "department": "Picking"
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
        },
        {
            "name": "Kyle's Zip Testers",
            "department": "Primary"
        }
    ]

    _.forEach(customers, function (data) {
        var status=LookUps.findOne({lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode,isDefault:true,hierId:hierId});
        if (status==null) LookUps.findOne({lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode,hierId:hierId});
        if (status==null) console.log("unable to find default status code for customer")
        else
        {
          var newCustomer = {

              objNameArray: ["Customer"],
              organization: {
                  organizationName: data.name
              },
              Customer: {
                  department: data.department,
                  status: status._id
              },
              location: null,
              hierId: hierId,
              testData: true
          }

          Meteor.call('addContactable', newCustomer, function (err, result) {
              if (!err)
                  console.log("Customer created for demo")
              else
                  console.log(err);
          });
        }
    });

    // TODO: Contacts seed
};

var loadJobs = function (hierId) {
    var customers = Contactables.find({objNameArray: 'Customer',hierId:hierId}).fetch();
    var jobTypes = dType.ObjTypes.find({parent: 'job'}).fetch()
    var industries = LookUps.find({lookUpCode: Enums.lookUpTypes.job.industry.lookUpCode,hierId:hierId}).fetch();
    var categories = LookUps.find({lookUpCode: Enums.lookUpTypes.job.category.lookUpCode,hierId:hierId}).fetch();
    var durations = LookUps.find({lookUpCode: Enums.lookUpTypes.job.duration.lookUpCode,hierId:hierId}).fetch();
    var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode,hierId:hierId}).fetch();
    var statuses = LookUps.find({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,hierId:hierId}).fetch();
    var publicJobTitles = [
        ["QCI"  ],
        ["Production/sewing"  ],
        ["Shipping And Receiving Clerk"  ],
        ["Access Operator"  ],

        ["Typist/statistical"  ],
        ["Auditor"  ],
        ["Warehouse Person"  ],
        ["Utility Worker"  ],
        ["Administrative Support"  ],
        ["Special Project(s)"  ],
        ["Accounts Payable"  ],
        ["Accounts Receivable Clerk"  ],
        ["12 hour Nurse"  ],
        ["Accounting Clerk 1"  ],
        ["Budget Analyst"  ],
        ["Accountant"  ],

        ["Yard People"  ],
        ["Wagemaster"  ],
        ["Welder"  ],
        ["Assembler Heavy"  ],
        ["Accountant"  ],
        ["Administrative Support"  ],

        ["Yard People"  ],
        ["Access Operator"  ],
        ["Admin. Assist."  ],
        ["Accountant"  ],
        ["Forklift"  ],
        ["Packaging"  ],
        ["Server Deposit"  ],
        ["Administrative Support"  ],
        ["Forklift"  ],
        ["Assembler Heavy"  ],
        ["Administrative Support"  ],
        ["C#"  ],
        ["Access Operator"  ],
        ["Yard People"  ],
        ["Background Checks"  ],
        ["General Administrator I"  ],
        ["Fabricating Machine"  ],
        ["Hand Nailer"  ]

    ];
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

  for (var i = 0; i < 25; ++i) {

        var randomJobType = 'Temporary'; //jobTypes[Math.floor(Math.random() * jobTypes.length)];
        var randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        var randomJobTitle = jobTitles [Math.floor(Math.random() * jobTitles.length)];
        var randomPublicJobTitle = publicJobTitles [Math.floor(Math.random() * publicJobTitles.length)];


        var newJob = {
            tags:[],
            jobRates:[],
            customer: randomCustomer._id,
            Temporary: {pay:0,bill:0,frequency:null},
            objNameArray: ['job', 'Temporary'],
            hierId: hierId,
            industry: industries[Math.floor(Math.random() * industries.length)]._id,
            category: categories[Math.floor(Math.random() * categories.length)]._id,
            duration: durations[Math.floor(Math.random() * durations.length)]._id,
            status: statuses[Math.floor(Math.random() * statuses.length)]._id,
            publicJobTitle: randomPublicJobTitle[0],
            jobTitle: randomJobTitle._id,
            startDate: today,
            endDate: tomorrow,
            description: "a job for all times",
            testData: true
        }
        // TODO: check objType's fields

        Meteor.call('addJob', newJob, function (err, result) {
            if (!err)
                console.log("Job created for demo")
            else
                console.log(err);
        })
    }
    ;
};

var loadTasks = function (hierId, usermane, userId) {
    var notes = [
        "Call " + employees[Math.floor(Math.random() * employees.length)].firstName + " asap",
        "Contact " + employees[Math.floor(Math.random() * employees.length)].lastName
    ];

    // Add users to hier
    var userIds = [];
    for (var j = 0; j < 5; ++j) {
        var newUser = {
            username: usermane + j,
            email: usermane + j + '@' + usermane + j + '.com',
            password: usermane + j
        }
        var id = Meteor.call('addHierUser', newUser, hierId);
        userIds.push(id);
    }
    if (userId)
        userIds.push(userId);

    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    for (var i = 0; i < 50; ++i) {
        var newTask = {
            begin: today,
            end: tomorrow,
            assign: [userIds[Math.floor(Math.random() * userIds.length)]],
            msg: notes[Math.floor(Math.random() * notes.length)],
            completed: null,
            hierId: hierId,
            userId: userId,
            testData: true
        }

        Meteor.call('createTask', newTask, function (err, result) {
            if (!err)
                console.log("Task created for demo");
            else
                console.log(err);
        })
    }
};

demoSeed = {
    loadContactables: loadContactables,
    loadJobs: loadJobs,
    loadTasks: loadTasks
}

// For testing
Meteor.methods({
    loadDemoData: function () {
        var user = Meteor.user();
        if (!user)
            return;

        loadContactables(user.hierId);
        loadJobs(user.hierId);
        loadTasks(user.hierId, user.username, user._id);
    }
})