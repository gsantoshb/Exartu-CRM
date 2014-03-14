// Common data
var employees = [
  {
    firstName:"Doe",
    lastName:"Andrew"},
  {
    firstName:"Gate",
    lastName:"John"
  },
  {
    firstName:"Smith",
    lastName:"John"
  },
  {
    firstName:"Campos",
    lastName:"Wilson"
  },
  {
    firstName:"Berneche"
    ,lastName:"Joe"
  },
  {
    firstName:"Soto",
    lastName:"Roger"
  },
  {
    firstName:"Schrute",
    lastName:"Anna"
  },
  {
    firstName:"Paycardguy",
    lastName:"Johnny"
  },
  {
    firstName:"Pasarini",
    lastName:"Fernando"
  },
  {
    firstName:"Campos",
    lastName:"Epay"
  },
  {
    firstName:"Climer",
    lastName:"Rae"
  },
  {
    firstName:"Lewis",
    lastName:"James"
  },
  {
    firstName:"InstantPay",
    lastName:"Jeff"
  },
  {
    firstName:"Cardtest",
    lastName:"EJpay"
  },
  {
    firstName:"Hanna",
    lastName:"Randy"
  },
  {
    firstName:"Pasarini",
    lastName:"Epay"
  },
  {
    firstName:"Lee",
    lastName:"Nestor"
  },
  {
    firstName:"McKee",
    lastName:"Geoffrey"
  },
  {
    firstName:"Pennington",
    lastName:"Charlene"
  },
  {
    firstName:"Wayne",
    lastName:"John"
  },
  {
    firstName:"Norris",
    lastName:"Aram"
  },
  {
    firstName:"Bean",
    lastName:"Mark"
  },
  {
    firstName:"Cossey",
    lastName:"Michael"
  },
  {
    firstName:"Edwards",
    lastName:"Robert"
  },
  {
    firstName:"Fox",
    lastName:"William"
  },
  {
    firstName:"Crosby",
    lastName:"Howard"
  },
  {
    firstName:"Small",
    lastName:"Jeff"
  },
  {
    firstName:"Whitson",
    lastName:"Charles"
  },
  {
    firstName:"Hart",
    lastName:"Pamela"
  },
  {
    firstName:"Cossey",
    lastName:"Zoe"
  },
]

var loadContactables = function(hierId) {
  // Employees
  _.forEach(employees, function(data){
    var jobTitles = LookUps.findOne({name: 'jobTitle'}).items;
    console.log('HierId:' + hierId);
    var randomJobTitle = jobTitles[Math.floor(Math.random()*jobTitles.length)];
    var newEmployee = {
      objNameArray: ["Employee"],
      person: {
        firstName: data.firstName,
        middleName: '',
        lastName: data.lastName,
        jobTitle: randomJobTitle.displayName
      },
      Employee: {
        description: "test"
      },
      location: null,
      hierId: hierId
    }

    Meteor.call('addContactable', newEmployee, function(err, result) {
      if(!err)
        console.log("Employee created for demo")
      else
        console.log(err);
    })
  });

  // Customers
  var customers = [
    {
      "name":"Yahoo",
      "department":"Shipping"
    },
    {
      "name":"ABC Corporation",
      "department":"Shipping"
    },
    {
      "name":"Action Staffing Solutions",
      "department":"Primary"
    },
    {
      "name":"Seintco",
      "department":"Labor Dispatch 1"
    },
    {
      "name":"Aldi Inc",
      "department":"Tap Room"
    },
    {
      "name":"Ames Construction, Inc.",
      "department":"Primary"
    },
    {
      "name":"Aquafina",
      "department":"Primary"
    },
    {
      "name":"Atlanta Staffing Source Inc",
      "department":"Sourcing"
    },
    {
      "name":"ATS Staffing",
      "department":"Primary"
    },
    {
      "name":"Best Buy",
      "department":"Store #456"
    },
    {
      "name":"Birkshire Lighting",
      "department":"Warehouse"
    },
    {
      "name":"compusa",
      "department":"Primary"
    },
    {
      "name":"Crom Equipment",
      "department":"Taxes"
    },
    {
      "name":"Crom Equipment",
      "department":"Warehouse"
    },
    {
      "name":"Crom Equipment",
      "department":"North Warehouse"
    },
    {
      "name":"Crom Equipment",
      "department":"Primary"
    },
    {
      "name":"Crom Equipment",
      "department":"Warehouse"
    },
    {
      "name":"Crom Equipment",
      "department":"Shipping"
    },
    {
      "name":"Dees Diner",
      "department":"Payroll"
    },
    {
      "name":"Dover Staffing",
      "department":"Primary"
    },
    {
      "name":"Elephant Industries Inc.",
      "department":"Human Resources"
    },
    {
      "name":"Flavor Splash",
      "department":"MIsc"
    },
    {
      "name":"Green Thumb",
      "department":"Warehouse"
    },
    {
      "name":"Green Thumb",
      "department":"Primary"
    },
    {
      "name":"Harper Designs",
      "department":"Warehouse"
    },
    {
      "name":"Mel's Tree Service",
      "department":"Primary"
    },
    {
      "name":"Midwest Wireless",
      "department":"Accountign"
    },
    {
      "name":"Midwest Wireless",
      "department":"Primary"
    },
    {
      "name":"Ohio Health",
      "department":"Warehouse"
    },
    {
      "name":"Pencil Designs Inc",
      "department":"Metal Bands"
    },
    {
      "name":"Prestige Staffing",
      "department":"Primary"
    },
    {
      "name":"Sales Tax Test",
      "department":"Primary"
    },
    {
      "name":"Stoerzinger Supply Co",
      "department":"Warehouse"
    },
    {
      "name":"Test Jeff Customer",
      "department":"Primary"
    },
    {
      "name":"Uniform Snow Inc",
      "department":"Warehouse"
    },
    {
      "name":"Warcraft Players Association",
      "department":"Primary"
    },
    {
      "name":"Whiting and Associates",
      "department":"Primary"
    },
    {
      "name":"Google",
      "department":"Primary"
    },
    {
      "name":"atlas staffing",
      "department":"Primary"
    },
    {
      "name":"Best Buy",
      "department":"Primary"
    },
    {
      "name":"Cleaning inc",
      "department":"Primary"
    },
    {
      "name":"David's Bridal",
      "department":"Primary"
    },
    {
      "name":"Global Technologies, Inc",
      "department":"Primary"
    },
    {
      "name":"Global Technologies, Inc.",
      "department":"Packline"
    },
    {
      "name":"Jon",
      "department":"Primary"
    },
    {
      "name":"Largo Boats",
      "department":"Primary"
    },
    {
      "name":"Mari's Company",
      "department":"Primary"
    },
    {
      "name":"Mari's Company",
      "department":"Picking"
    },
    {
      "name":"Stanley Tools",
      "department":"Primary"
    },
    {
      "name":"Stanley Tools",
      "department":"Primary"
    },
    {
      "name":"Stanley Tools",
      "department":"Primary"
    },
    {
      "name":"Talbots",
      "department":"Primary"
    },
    {
      "name":"Vandy Enterprises",
      "department":"Primary"
    },
    {
      "name":"Walmart",
      "department":"Primary"
    },
    {
      "name":"XYZ Corp",
      "department":"Primary"
    },
    {
      "name":"Kyle's Zip Testers",
      "department":"Primary"
    }
  ]

  _.forEach(customers, function(data){
    var newCustomer = {
      objNameArray: ["Customer"],
      organization: {
        organizationName: data.name,
      },
      Customer: {
        deparment: data.deparment
      },
      location: null,
      hierId: hierId
    }

    Meteor.call('addContactable', newCustomer, function(err, result) {
      if(!err)
        console.log("Customer created for demo")
      else
        console.log(err);
    })
  });

  // TODO: Contacts seed
};

var loadJobs = function(hierId) {
  var customers = Contactables.find({objNameArray: 'Customer'}).fetch();
  var jobTypes = ObjTypes.find({objGroupType: 'job'}).fetch();
  var industries = LookUps.findOne({name: 'jobIndustry'}).items;
  var categories = LookUps.findOne({name: 'jobCategory'}).items;
  var durations = LookUps.findOne({name: 'jobDuration'}).items;
  var jobTitles = LookUps.findOne({name: 'jobTitle'}).items;
  var statuses = LookUps.findOne({name: 'jobStatus'}).items;
  var publicJobTitles = [
    ["QCI"  ],
    ["Production/sewing"  ],
    ["Shipping And Receiving Clerk"  ],
    ["Production Worker"  ],
    ["Packout"  ],
    ["Closeout"  ],
    ["Plasterer"  ],
    ["Air Condtg Mech"  ],
    ["Stock Picker/packer"  ],
    ["Tool-crib Attendant"  ],
    ["Dry Wall Hanger"  ],
    ["Auto Tech"  ],
    ["Robotics Technician"  ],
    ["Housekeeper"  ],
    ["Tape Pool"  ],
    ["Maintenance Technician"  ],
    ["Production/assembler"  ],
    ["QCI"  ],
    ["Production/sewing"  ],
    ["Shipping And Receiving Clerk"  ],
    ["Production Worker"  ],
    ["Packout"  ],
    ["Closeout"  ],
    ["Plasterer"  ],
    ["Air Condtg Mech"  ],
    ["Stock Picker/packer"  ],
    ["Tool-crib Attendant"  ],
    ["Dry Wall Hanger"  ],
    ["Auto Tech"  ],
    ["Robotics Technician"  ],
    ["Housekeeper"  ],
    ["Tape Pool"  ],
    ["Maintenance Technician"  ],
    ["Production/assembler"  ],
    ["QCI"  ],
    ["Production/sewing"  ],
    ["Shipping And Receiving Clerk"  ],
    ["Production Worker"  ],
    ["Packout"  ],
    ["Closeout"  ],
    ["Plasterer"  ],
    ["Air Condtg Mech"  ],
    ["Stock Picker/packer"  ],
    ["Tool-crib Attendant"  ],
    ["Dry Wall Hanger"  ],
    ["Auto Tech"  ],
    ["Robotics Technician"  ],
    ["Housekeeper"  ],
    ["Tape Pool"  ],
    ["Maintenance Technician"  ],
    ["Production/assembler"  ],
    ["QCI"  ],
    ["Production/sewing"  ],
    ["Shipping And Receiving Clerk"  ],
    ["Production Worker"  ],
    ["Packout"  ],
    ["Closeout"  ],
    ["Plasterer"  ],
    ["Air Condtg Mech"  ],
    ["C#"  ],
    ["C#"  ],
    ["C#"  ],
    ["Cashier I"  ],
    ["Warehouse Person"  ],
    ["C Operator"  ],
    ["Assembler"  ],
    ["C Operator"  ],
    ["Booth Attendant"  ],
    ["Clerk I"  ],
    ["Crane Operator"  ],
    ["Crane Operator"  ],
    ["Crane Operator"  ],
    ["Crane Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Plasterer"  ],
    ["Plasterer"  ],
    ["Plasterer"  ],
    ["Housekeeper"  ],
    ["Housekeeper"  ],
    ["Housekeeper"  ],
    ["Housekeeper"  ],
    ["Production/assembler"  ],
    ["Production/assembler"  ],
    ["Production/assembler"  ],
    ["Production/assembler"  ],
    ["QCI"  ],
    ["Production/assembler"  ],
    ["Production Worker"  ],
    ["Production Worker"  ],
    ["Production Worker"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Sorter"  ],
    ["4294969345"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["2 Day Benefit"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["11200 Gold Express"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["Accountant"  ],
    ["12 hour nurse weekend"  ],
    ["11200 Gold Express"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Industrial/ Misc"  ],
    ["Casual Laborer Heavy"  ],
    ["Clerk-warehouse"  ],
    ["Access Operator"  ],
    ["12 hour Nurse"  ],
    ["Accountant"  ],
    ["Access Operator"  ],
    ["AS 400"  ],
    ["2 Day Benefit"  ],
    ["Administrative Support"  ],
    ["12 hour Nurse"  ],
    ["Cashier I"  ],
    ["Access Operator"  ],
    ["Junior Clerk"  ],
    ["Cashier I"  ],
    ["C Operator"  ],
    ["2 Day Benefit"  ],
    ["Administrative Support"  ],
    ["Access Operator"  ],
    ["Administrative Support"  ],
    ["12 hour Nurse"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Access Operator"  ],
    ["Access Operator"  ],
    ["Access Operator"  ],
    ["Accountant"  ],
    ["12 hour Nurse"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["Access Operator"  ],
    ["C Operator"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["2 Day Benefit"  ],
    ["11200 Gold Express"  ],
    ["2 Day Benefit"  ],
    ["2 Day Benefit"  ],
    ["635-6855"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["C Operator"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["635-6855"  ],
    ["2 Day Benefit"  ],
    ["11200 Gold Express"  ],
    ["2 Day Benefit"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["Access Operator"  ],
    ["Account Analyst"  ],
    ["C Operator"  ],
    ["2 Day Benefit"  ],
    ["C Operator"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["Accountant"  ],
    ["C Operator"  ],
    ["Accountant"  ],
    ["635-6855"  ],
    ["Access Operator"  ],
    ["2 Day Benefit"  ],
    ["Access Operator"  ],
    ["12 hour Nurse"  ],
    ["635-6855"  ],
    ["Access Operator"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["Administrative Support"  ],
    ["12 hour Nurse"  ],
    ["Access Operator"  ],
    ["C Operator"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["C Operator"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["C Operator"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["C Operator"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["11200 Gold Express"  ],
    ["C Operator"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["11200 Gold Express"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["Administrative Support"  ],
    ["2 Day Benefit"  ],
    ["4294969482"  ],
    ["2 Day Benefit"  ],
    ["11200 Gold Express"  ],
    ["Access Operator"  ],
    ["Account Analyst"  ],
    ["Account Analyst"  ],
    ["Access Operator"  ],
    ["Access Operator"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["11200 Gold Express"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["12 hour Nurse"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour Nurse"  ],
    ["2 Day Benefit"  ],
    ["2 Day Benefit"  ],
    ["12 hour Nurse"  ],
    ["C#"  ],
    ["Billable Expenses"  ],
    ["Billable Expenses"  ],
    ["Billing Specialist"  ],
    ["Bonus"  ],
    ["Billing Specialist"  ],
    ["Billable Expenses"  ],
    ["Bookkeeper"  ],
    ["Billable Expenses"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["Access Operator"  ],
    ["Accounting Clerk III"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Bank Teller"  ],
    ["Accounting Clerk III"  ],
    ["Billable Expenses"  ],
    ["635-6855"  ],
    ["Administrative Support"  ],
    ["Accountant"  ],
    ["Billable Expenses"  ],
    ["Billable Expenses"  ],
    ["Banking Clerk"  ],
    ["Billable Expenses"  ],
    ["Billable Expenses"  ],
    ["Booth Attendant"  ],
    ["635-6855"  ],
    ["635-6855"  ],
    ["Bookkeeper"  ],
    ["Access Operator"  ],
    ["Booth Attendant"  ],
    ["12 hour nurse weekend"  ],
    ["12 hour nurse weekend"  ],
    ["Bookkeeper"  ],
    ["Bookkeeper"  ],
    ["12 hour Nurse"  ],
    ["2 Day Benefit"  ],
    ["Forklift"  ],
    ["Packer"  ],
    ["Typist/bilingual"  ],
    ["Supply Specialist"  ],
    ["Accountant"  ],
    ["Accounting Clerk III"  ],
    ["Account Rep. II"  ],
    ["12 hour Nurse"  ],
    ["Agent"  ],
    ["Occupational Therapist"  ],
    ["Access Operator"  ],
    ["Assembler"  ],
    ["11200 Gold Express"  ],
    ["Access Operator"  ],
    ["Accountant"  ],
    ["2 Day Benefit"  ],
    ["Forklift"  ],
    ["Access Operator"  ],
    ["11200 Gold Express"  ],
    ["Forklift"  ],
    ["Forklift"  ],
    ["Forklift"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Forklift"  ],
    ["Forklift"  ],
    ["Access Operator"  ],
    ["Access Operator"  ],
    ["Order Puller"  ],
    ["11200 Gold Express"  ],
    ["Account Analyst"  ],
    ["Account Analyst"  ],
    ["Account Analyst"  ],
    ["Account Rep. II"  ],
    ["Account Analyst"  ],
    ["Fabricating Machine"  ],
    ["12 hour Nurse"  ],
    ["Auto Tech"  ],
    ["Auto Tech"  ],
    ["Auto Tech"  ],
    ["Auto Tech"  ],
    ["C Operator"  ],
    ["Administrative Support"  ],
    ["12 hour nurse weekend"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Admin. Assist."  ],
    ["Auxiliary Salespersn"  ],
    ["Auxiliary Salespersn"  ],
    ["Auxiliary Salespersn"  ],
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
    ["12 hour Nurse"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Yard People"  ],
    ["Wagemaster"  ],
    ["Welder"  ],
    ["Assembler Heavy"  ],
    ["Accountant"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
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
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Wagemaster"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["C#"  ],
    ["Access Operator"  ],
    ["Yard People"  ],
    ["Background Checks"  ],
    ["General Administrator I"  ],
    ["Fabricating Machine"  ],
    ["Hand Nailer"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Account Analyst"  ],
    ["Fabricating Machine"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Access Operator"  ],
    ["Assembler"  ],
    ["Accountant"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Atm Technician"  ],
    ["Driver-light Vehicle"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Access Operator"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Fabricating Machine"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Welder"  ],
    ["Fabricating Machine"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Accountant"  ],
    ["Atm Technician"  ],
    ["Assembler"  ],
    ["Fabricating Machine"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Atm Technician"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Fabricating Machine"  ],
    ["Welder"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ],
    ["C#"  ],
    ["Access Operator"  ],
    ["Account Rep. II"  ],
    ["Underwriter"  ],
    ["Unbillable Training"  ],
    ["Unbillable Expenses"  ],
    ["Administrative Support"  ],
    ["Administrative Support"  ]
  ];
  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);

  for(var i = 0; i < 100; ++i) {
    var randomJobType = jobTypes[Math.floor(Math.random()*jobTypes.length)];
    var randomCustomer = customers[Math.floor(Math.random()*customers.length)];
    var randomJobTitle = jobTitles [Math.floor(Math.random()*jobTitles .length)];
    var randomPublicJobTitle = publicJobTitles [Math.floor(Math.random()*publicJobTitles .length)];

    var newJob = {
      customer: randomCustomer._id,
      objNameArray: [randomJobType.objName],
      hierId: hierId,
      industry: industries[Math.floor(Math.random()*industries.length)].code,
      category: categories[Math.floor(Math.random()*categories.length)].code,
      duration: durations[Math.floor(Math.random()*durations.length)].code,
      status: statuses[Math.floor(Math.random()*statuses.length)].code,
      publicJobTitle: randomPublicJobTitle[0],
      startDate: today,
      endDate: tomorrow,
      description: ""
    }
    // TODO: check objType's fields
    newJob[randomJobType.objName] = {
      jobTitle: randomJobTitle.code
    };

    console.dir(newJob);
    Meteor.call('addJob', newJob, function(err, result){
      if(!err)
        console.log("Job created for demo")
      else
        console.log(err);
    })
  };
};

var loadTasks = function(hierId, usermane, userId) {
  var notes = [
    "Call " + employees[Math.floor(Math.random()*employees.length)].firstName + " asap",
    "Contact " + employees[Math.floor(Math.random()*employees.length)].lastName
  ];

  // Add users to hier
  var userIds = [];
  var rol = Roles.findOne();
  console.dir(rol);
  for(var j = 0; j < 5; ++j) {
    var newUser = {
      username: usermane + j,
      email: usermane + j + '@' + usermane + j + '.com',
      password: usermane + j,
      roles: [rol]
    }
    var id = Meteor.call('addHierUser', newUser, hierId);
    userIds.push(id);
  }

  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);

  for(var i = 0; i < 50; ++ i) {
    var newTask = {
      begin: today,
      end: tomorrow,
      assign: [userIds[Math.floor(Math.random()*userIds.length)]],
      note: notes[Math.floor(Math.random()*notes.length)],
      completed: null,
      hierId: hierId,
      userId: userId
    }

    Meteor.call('crateTask', newTask, function(err, result){
      if(!err)
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