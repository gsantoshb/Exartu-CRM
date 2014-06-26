Template.dateTimePicker.rendered= function(){
  var options={
    language: 'en',
    defaultDate: this.data.value,
    useSeconds: false
  }
  if (this.data.from){
    options.minDate= this.data.from
  }
  if (this.data.to){
    options.maxDate= this.data.to
  }
  this.$('.dateTimePicker').datetimepicker(options)


};
Template.dateTimePicker.events({
  'dp.change .dateTimePicker':function (e, ctx) {
    if (ctx.onChange && _.isFunction(ctx.onChange)){
      ctx.onChange();
    }
  }
})