// Job statuses
//var getLookUpName = function (lookUpName, code) {
//  var lookUp = LookUps.findOne({
//    name: lookUpName
//  });
//  if (!lookUp)
//    return;
//  var lookUpValue = _.find(lookUp.items, function (item) {
//    return item.code == code;
//  });
//  if (!lookUpValue)
//    return;
//  return lookUpValue.displayName;
//}
JobCalculatedStatus= {
  get:function(job){
    var now=new Date;
    var start= _.isDate(job.startDate)? job.startDate: new Date(job.startDate)
    var end= _.isDate(job.endDate)? job.endDate: new Date(job.endDate)

    var result={
      open: (now < start),
      filled: !! job.placement
    }
    return result
  },
  getQuery: function(type){
    var now=new Date;

    switch (type){
      case Enums.jobStatus.open:
        return {
          startDate: { $gte: now }
        }
      case Enums.jobStatus.closed:
        return {
          endDate: { $lte: now }
        }
      case Enums.jobStatus.filled:
        return {
          $and:[
            { placement: { $ne: null } },
            { placement: { $exists: true} }
          ]
        }
      case Enums.jobStatus.unfilled:
        return {
          $or:[
            { placement: null },
            { placement: { $exists: false } }
          ]
        }
    }
  }
};


// General lookups
LookUps = new Meteor.Collection("lookUps");
LookUpsHandler = Meteor.subscribe('lookUps');

