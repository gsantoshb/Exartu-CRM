var self={};
Utils.reactiveProp(self,'editMode',false);
Template.jobRates.created=function(){
  self.editMode=false;
  loadRates();
}
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
  getType: function(typeId){
    console.log('jobratetype',typeId,JobRateTypes.findOne({ _id: typeId }))
    return  JobRateTypes.findOne({ _id: typeId });
  },
  round: function(value){
    return Math.round(value * 100) / 100;
  },
  editMode: function(){
    return self.editMode;
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
  }
})



// Edit Rates

var newRate={
  type:null,
  pay: 0,
  bill: 0
}
var rates;

var ratesDep=new Deps.Dependency;
UI.registerHelper('ratesEdit', function(){
  rates=  this.rates;
  return Template.ratesEditTemplate;
})

Template.ratesEditTemplate.helpers({
  rates: function(){
    ratesDep.depend();
    return rates;
  },
  getType: function(typeId){
    return  JobRateTypes.findOne({ _id: typeId });
  },
  newRate: function(){
    return newRate;
  },
  getAvailableType: function(){
    var rateTypes=JobRateTypes.find().fetch();
    ratesDep.depend();
    return _.filter(rateTypes,function(type){
      return ! _.findWhere(rates, { type: type._id });
    });

  }
});

Template.ratesEditTemplate.events({
  'click .addRate': function(e, ctx){
    newRate.type=ctx.$('.newRateType').val();

    if (! newRate.type) return;

    if (_.findWhere(rates, { type: newRate.type })) return;

    rates.push(_.clone(newRate));
    Jobs.update({ _id: Session.get('entityId') },{ $set: { jobRates: rates } });
    ratesDep.changed();
  },
  'click .removeRate': function(e, ctx){
    rates.splice(rates.indexOf(this), 1)
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
});