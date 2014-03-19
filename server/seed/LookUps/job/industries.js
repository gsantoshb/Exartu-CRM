_.forEach([
  {
    displayName: "All"
  },
  {
    displayName: "Agriculture/Forestry/Fishing"
  },
  {
    displayName: "Metals and Minerals"
  },
  {
    displayName: "Energy and Utilities"
  },
  {
    displayName: "Construction - Industrial Facilities and Infrastructure"
  },
  {
    displayName: "Aerospace and Defense"
  },
  {
    displayName: "Automotive and Parts Mfg"
  },
  {
    displayName: "Biotechnology/Pharmaceuticals"
  },
  {
    displayName: "Chemicals/Petro-Chemicals"
  },
  {
    displayName: "Consumer Packaged Goods Manufacturing"
  },
  {
    displayName: "Electronics, Components, and Semiconductor Mfg"
  },
  {
    displayName: "Manufacturing - Other"
  },
  {
    displayName: "Printing and Publishing "
  },
  {
    displayName: "Clothing and Textile Manufacturing"
  },
  {
    displayName: "Wholesale Trade/Import-Export"
  },
  {
    displayName: "Retail"
  },
  {
    displayName: "Travel, Transportation and Tourism"
  },
  {
    displayName: "Transport and Storage - Materials "
  },
  {
    displayName: "Internet Services"
  },
  {
    displayName: "Broadcasting, Music, and Film"
  },
  {
    displayName: "Telecommunications Services"
  },
  {
    displayName: "Banking"
  },
  {
    displayName: "Insurance"
  },
  {
    displayName: "Real Estate/Property Management"
  },
  {
    displayName: "Rental Services"
  },
  {
    displayName: "Accounting and Auditing Services"
  },
  {
    displayName: "Advertising and PR Services"
  },
  {
    displayName: "Architectural and Design Services"
  },
  {
    displayName: "Management Consulting Services"
  },
  {
    displayName: "Computer Hardware"
  },
  {
    displayName: "Computer Software"
  },
  {
    displayName: "Legal Services"
  },
  {
    displayName: "Waste Management"
  },
  {
    displayName: "Education"
  },
  {
    displayName: "Healthcare Services"
  },
  {
    displayName: "Performing and Fine Arts"
  },
  {
    displayName: "Sports and Physical Recreation"
  },
  {
    displayName: "Hotels and Lodging"
  },
  {
    displayName: "Restaurant/Food Services"
  },
  {
    displayName: "Staffing/Employment Agencies"
  },
  {
    displayName: "Nonprofit Charitable Organizations"
  },
  {
    displayName: "Personal and Household Services"
  },
  {
    displayName: "Government and Military"
  },
  {
    displayName: "Security and Surveillance"
  },
  {
    displayName: "Automotive Sales and Repair Services"
  },
  {
    displayName: "Business Services - Other"
  },
  {
    displayName: "Computer/IT Services"
  },
  {
    displayName: "Construction - Residential & Commercial/Office"
  },
  {
    displayName: "Engineering Services"
  },
  {
    displayName: "Entertainment Venues and Theaters"
  },
  {
    displayName: "Financial Services"
  },
  {
    displayName: "Food and Beverage Production"
  },
  {
    displayName: "Marine Mfg & Services"
  },
  {
    displayName: "Medical Devices and Supplies"
  },
  {
    displayName: "Other/Not Classified"
  }
],
  function (item) {
    item.codeType = Enums.lookUpTypes.job.industry.code;
    systemLookUps.push(item);
  }
);