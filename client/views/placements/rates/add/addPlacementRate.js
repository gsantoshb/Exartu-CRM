var type=null;
var bill=0;
var pay=0;
Template.addPlacementRate.helpers({
  types: function(){
    return PlacementRateTypes.find();
  }
})
Template.addPlacementRate.events({
  'change select':function(e){
    type=e.target.value
  },
  'change .bill':function(e){
    bill=e.target.value
  },
  'change .pay':function(e){
    pay=e.target.value
  },
  'click .accept':function(){
    if(!type)
      return;

    Placements.update({_id: Session.get('entityId')},{$push: {placementRates: {type: type, bill: bill, pay: pay}}}, function(err, result){
      if(err){
        console.log(err)
      }else{
        $('.modal-host').children().modal('toggle')
     }
    })
  }
})