HierarchyManager = {
  create: function(hier) {
    //TODO: Check options values

    if (hier.parent != null) {
     var parentHier = Hierarchies.findOne({
       _id: hier.parent
     });
     if (parentHier == null)
       throw new Meteor.Error(404, "Parent hierarchy does not exist");

     hier._id = generateUniqueHierId(hier.parent);

    } else {
     hier._id = generateUniqueHierId(ExartuConfig.SystemHierarchyId);
    }

    hier.planCode = 0;

    hier.configuration={
     webName: hier.name,
     title: hier.name
    };

    hier.dateCreated = new Date();

    return Hierarchies.insert(hier);
  },
  getCurrentHierUsers: function() {
    return Meteor.users.find({
      hierId: Meteor.user().hierId
    }).fetch();
  },
  changeCurrentHier: function(hierId) {
    var user = Meteor.user();
    //todo:check if it's valid
    return Meteor.users.update({_id: user._id}, { $set: { currentHierId: hierId } });
  },
  setLookupDefault: function(lookUpCode, valueId) {
    var lookUpValue = LookUps.findOne({lookUpCode: lookUpCode, _id: valueId});

    if (!lookUpValue)
      throw new Meteor.Error(500, 'There is no value with id ' + valueId + ' for lookup with code value: ' + lookUpCode);

    // Remove old default value for this lookup type
    LookUps.update({ isDefault: true,  lookUpCode: lookUpCode, hierId: Meteor.user().currentHierId},
      {
        $set: {
          isDefault: false
        }
      },{ multi: true }
    );

    // Add the new default value
    LookUps.update({_id: valueId},
      {
        $set: {
          isDefault: true
        }
      }
    );
  },
  saveConfiguration: function(options) {
    var user= Meteor.user();
    if (!user)
      return null
    if (/\s/.test(options.webName))
      throw new Meteor.Error(500, 'webName contains spaces');

    if (Hierarchies.findOne({'configuration.webName': options.webName, _id: { $ne: user.hierId } })){
      throw new Meteor.Error(500, 'webName already exists');
    }

    var hier=Hierarchies.findOne({_id: user.hierId});
    var oldCong=hier.configuration || {};

    var conf={
      webName: options.webName || oldCong.webName,
      title: _.isString(options.title)? options.title : oldCong.title,
      background: options.background || oldCong.webName,
      logo: options.logo || oldCong.logo
    }

    Hierarchies.update({_id: user.hierId}, {$set: {configuration: conf}});
  }
};

var generateUniqueHierId = function (prefix) {
  var suffixId = (1 + Math.random()).toString(36).substr(2, 3);
  //console.log(prefix);
  var candidate = prefix != undefined ? prefix + '-' + suffixId : suffixId;

  if (Hierarchies.findOne({
      _id: candidate
    }) == null) {
    return candidate;
  } else {
    generateUniqueHierId(prefix);
  }
};

createHouseAccount = function(hierarchy){
  if (!Contactables.findOne({ hierId: hierarchy._id,  houseAccount: true})) {
    var customer = {
      objNameArray: [
        "organization",
        "Customer",
        "contactable"
      ],
      houseAccount: true,
      organization: {
        organizationName: "House Account"
      },
      Customer: {

      },
      hierId: hierarchy._id,
      userId: (hierarchy.user && hierarchy.user.length > 0) ? hierarchy.user[0] : null
    };
    Contactables.insert(customer);
  }
};