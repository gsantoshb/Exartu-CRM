HierarchyManager = {
    create: function (hier) {
        //TODO: Check options values

        if (hier.parent != null) {
            var parentHier = Hierarchies.findOne({
                _id: hier.parent
            });
            if (parentHier == null)
                throw new Meteor.Error(404, "Parent hierarchy does not exist");

            hier._id = generateUniqueHierId(hier.parent);

        } else {
            hier._id = generateUniqueHierId(ExartuConfig.TenantId);
        }

        hier.planCode = 0;

        // Get count of hierarchies with the same name
        var hierNameUseCount = Hierarchies.find({'configuration.webName': hier.name}).count();

        hier.configuration = {
            webName: hier.name + (hierNameUseCount > 0 ? '-' + hierNameUseCount : ''), // Add a suffix if hier.name is already used
            title: hier.name
        };
        var hierId = Hierarchies.insert(hier);
        return hierId
    },
    getCurrentHierUsers: function () {
        return Meteor.users.find({
            hierId: Meteor.user().hierId
        }).fetch();
    },
    changeCurrentHier: function (hierid, userid) {
        var user = Meteor.user();
        if (userid) user = Meteor.users.findOne({_id: userid});
        Meteor.users.update({_id: user._id}, {$set: {currentHierId: hierid, hierId: hierid}});
        Meteor.users.update({_id: user._id}, {$unset: {lastClientUsed: "", lastEmployeeUsed: ""}});

      // Save the latest 5 hier used
      var latestHiers = user.latestHiers ? _.first(_.filter(user.latestHiers, function(hier) {return hier !== hierid}), 4) : [];
      if (latestHiers.indexOf(hierid) == -1) {
        latestHiers.unshift(hierid);
        Meteor.users.update({_id: user._id}, {$set: {latestHiers: latestHiers}});
      }
    },
    setLookupDefault: function (lookUpCode, valueId) {
        var lookUpValue = LookUps.findOne({lookUpCode: lookUpCode, _id: valueId});

        if (!lookUpValue)
            throw new Meteor.Error(500, 'There is no value with id ' + valueId + ' for lookup with code value: ' + lookUpCode);

        // Remove old default value for this lookup type
        LookUps.update({isDefault: true, lookUpCode: lookUpCode, hierId: Meteor.user().currentHierId},
            {
                $set: {
                    isDefault: false
                }
            }, {multi: true}
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
    getHierByPhoneNumber : function(phoneNumber){
        var hier = Hierarchies.findOne({'phoneNumber.value': {$regex: phoneNumber.replace(/\+/g, ''), $options: 'x'}});
        if (!hier)
            throw new Error('There is no hierarchy with phone number ' + phoneNumber);
        return hier;
    },
    saveConfiguration: function (options) {
        var user = Meteor.user();
        if (!user)
            return null;

        var currentHierId = Utils.getUserHierId(user._id);

        if (/\s/.test(options.webName))
            throw new Meteor.Error(500, 'webName contains spaces');

        if (Hierarchies.findOne({'configuration.webName': options.webName, _id: {$ne: currentHierId}})) {
            throw new Meteor.Error(500, 'webName already exists');
        }

        var hier = Hierarchies.findOne({_id: currentHierId});
        var oldCong = hier.configuration || {};

        var conf = {
            webName: options.webName || oldCong.webName,
            title: _.isString(options.title) ? options.title : oldCong.title,
            background: options.background || oldCong.webName,
            logo: options.logo || oldCong.logo
        };

        Hierarchies.update({_id: currentHierId}, {$set: {configuration: conf}});
    },
    isWebNameAvailable: function (webName) {
        var currentHierId = Utils.getUserHierId(Meteor.userId());
        return !Hierarchies.findOne({'configuration.webName': webName, _id: {$ne: currentHierId}});
    },
    setCurrentHierarchyMailConf: function(mail, password, host, port){
      if(_.isString(mail)&& _.isString(password) && _.isString(host) && _.isNumber(port)) {
        var encryptedPass =  CryptoJS.AES.encrypt(password, ExartuConfig.EncryptCode);
        var mailSubs = {mail: mail, password: encryptedPass.toString(), host: host, port: port};
        Hierarchies.update({_id: Meteor.user().currentHierId}, {$set: {mailSubscription: mailSubs}});
      }
      else{
        throw new Meteor.Error('Invalid parameters type on hierachy mail config');

      }
    },

  setTwEnterpriseAccount: function (hierId, accountInfo) {
    // Validations
    if (!hierId) throw new Error('Hier ID is required');
    if (!accountInfo) throw new Error('Account information is required');

    // Validate info
    if (!accountInfo.username || !accountInfo.password)
      throw new Error('Username and password must be provided to set up Enterprise');

    // Validate credentials against the API
    var accountInfo = {
      username: accountInfo.username,
      password: accountInfo.password,
    };
    var twApiHelper = new TwApiHelper(accountInfo);
    var tokenInfo = twApiHelper.login();
    _.extend(accountInfo, tokenInfo);

    // Save configuration
    Hierarchies.update({_id: hierId}, {$set: {enterpriseAccount: accountInfo}});
  },
  syncTwEnterpriseEmployees: function (hierId) {
    // Check the hier has an Enterprise account set up
    var hier = Hierarchies.findOne({_id: hierId, enterpriseAccount: {$exists: true}, 'enterpriseAccount.username': {$exists: true}});
    if (!hier) throw new Error("Hierarchy invalid. Make sure TW Enterprise is set up");

    // Check the process is not running already
    if (hier.enterpriseAccount.empSync) throw new Error("TW Enterprise Employee Sync already running");

    // Mark the sync is in progress
    Hierarchies.update({_id: hierId}, {$set: {'enterpriseAccount.empSync': true}});

    // Set up an api helper
    var accountInfo = {
      hierId: hier._id,
      username: hier.enterpriseAccount.username,
      password: hier.enterpriseAccount.password,
      accessToken: hier.enterpriseAccount.accessToken,
      tokenType: hier.enterpriseAccount.tokenType
    };

    Meteor.setTimeout(function () {
      TwApi.syncEmployees(accountInfo);
    }, 500);
  },
  syncTwContactablesIntoAida: function (userId, hierId) {
    // Check the hier has an Enterprise account set up
    var hier = Hierarchies.findOne({_id: hierId, enterpriseAccount: {$exists: true}, 'enterpriseAccount.username': {$exists: true}});
    if (!hier) throw new Error("Hierarchy invalid. Make sure TW Enterprise is set up");

    // Check the process is not running already
    if (hier.enterpriseAccount.contactablesSync) throw new Error("TW Contactables Import already running");

    // Mark the sync is in progress
    Hierarchies.update({_id: hierId}, {$set: {'enterpriseAccount.contactablesSync': true}});

    // Set up an api helper
    var accountInfo = {
      hierId: hier._id,
      username: hier.enterpriseAccount.username,
      password: hier.enterpriseAccount.password,
      accessToken: hier.enterpriseAccount.accessToken,
      tokenType: hier.enterpriseAccount.tokenType
    };

    Meteor.setTimeout(function () {
      TwImport.importContactables(userId, accountInfo);
    }, 500);
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

createHouseAccount = function (hierarchy) {
    if (!Contactables.findOne({hierId: hierarchy._id, houseAccount: true})) {
        var client = {
            objNameArray: [
                "organization",
                "Client",
                "contactable"
            ],
            houseAccount: true,
            organization: {
                organizationName: "House Account"
            },
            Client: {},
            hierId: hierarchy._id,
            userId: (hierarchy.user && hierarchy.user.length > 0) ? hierarchy.user[0] : null,
            dateCreated: Date.now()
        };
        Contactables.insert(client);
    }
};
