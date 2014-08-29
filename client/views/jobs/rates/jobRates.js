var self={};
Utils.reactiveProp(self,'editMode',false);
Template.jobRates.created=function(){
  self.editMode=false;
  loadRates();
}
var ratesDep=new Deps.Dependency;
UI.registerHelper('jobRates', function(){
  rates=  this.rates;
  return Template.jobRatesTemplate;
})


// Edit Rates

var newRate={
  type:null,
  pay: 0,
  bill: 0
}
var rates;
var loadRates=function(){
  var job=Jobs.findOne({
    _id: Session.get('entityId')
  });

  self.rates=job.jobRates;
}
Template.jobRates.helpers({
  rates: function(){
    return self.rates
  },
  newRate: function(){
    return newRate;
  },
  getType: function(typeId){
    return  JobRateTypes.findOne({ _id: typeId });
  },
  round: function(value){
    return Math.round(value * 100) / 100;
  },
  editMode: function(){
    return self.editMode;
  },
  getAvailableType: function() {
    var rateTypes = JobRateTypes.find().fetch();
    ratesDep.depend();
    return _.filter(rateTypes, function (type) {
      return !_.findWhere(self.rates, { type: type._id });
    });
  }
})
Template.jobRates.events({
  'click .editRate': function(){
    self.editMode= ! self.editMode;
  },
  'click .cancelButtonRates': function(){
    loadRates();
    self.editMode=false;
  },
  'click .saveButtonRates': function(){
    Jobs.update({ _id: Session.get('entityId') },{ $set: { jobRates: self.rates } });
    self.editMode=false;
  },
  'click .addRate': function(e, ctx){
    newRate.type=ctx.$('.newRateType').val();

    if (! newRate.type) return;

    if (_.findWhere(rates, { type: newRate.type })) return;

    self.rates.push(_.clone(newRate));
    Jobs.update({ _id: Session.get('entityId') },{ $set: { jobRates: self.rates } });
    self.ratesDep.changed();
  },
  'click .removeRate': function(e, ctx){

    self.rates.splice(self.rates.indexOf(this), 1)
    ratesDep.changed();
  },
//  'change .newRateType': function(e, ctx){
//    newRate.type= e.target.value;
//  },
  'change .payRateInput': function(e, ctx){
    this.pay= e.target.value;
  },
  'change .billRateInput': function(e, ctx){
    this.bill= e.target.value;
  }
})







