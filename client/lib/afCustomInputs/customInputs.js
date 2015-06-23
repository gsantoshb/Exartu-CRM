
AutoForm.addInputType('afSimpleCheckbox', {
  template: 'afSimpleCheckbox',
  valueOut: function () {
    return !!this.is(":checked");
  },
  valueConverters: {
    "string": function (val) {
      if (val === true) {
        return "TRUE";
      } else if (val === false) {
        return "FALSE";
      }
      return val;
    },
    "stringArray": function (val) {
      if (val === true) {
        return ["TRUE"];
      } else if (val === false) {
        return ["FALSE"];
      }
      return val;
    },
    "number": function (val) {
      if (val === true) {
        return 1;
      } else if (val === false) {
        return 0;
      }
      return val;
    },
    "numberArray": function (val) {
      if (val === true) {
        return [1];
      } else if (val === false) {
        return [0];
      }
      return val;
    }
  },
  contextAdjust: function (context) {
    if (context.value === true) {
      context.atts.checked = "";
    }
    //don't add required attribute to checkboxes because some browsers assume that to mean that it must be checked, which is not what we mean by "required"
    delete context.atts.required;
    return context;
  }
})




AutoForm.addInputType('afButtonGroup', {
  template: 'afButtonGroup',
  valueOut: function (ctx) {
    return Blaze.getData(this[0]).selected.get();
  },
  contextAdjust: function(ctx){
    ctx.buttonArray = ctx.atts.buttonArray;
    delete ctx.atts.buttonArray;
    ctx.selected = ctx.atts.selected;
    delete ctx.atts.selected;
    return ctx;
  }
})


var actualizeButtons = function(self){
  var newArray = [];
  _.each(self.data.buttonArray.get(), function(b){
    if(self.data.selected.get() === b.value){
      _.extend(b,{clase:"btn btn-sm btn-primary"});
      newArray.push(b)
    }
    else{
      _.extend(b,{clase:"btn btn-sm btn-default"});
      newArray.push(b)
    }

  })
  self.data.buttonArray.set(newArray);
}

Template.afButtonGroup.created = function(){
  var selected = new ReactiveVar();
  var buttonArray = new ReactiveVar();
  selected.set(this.data.selected);
  buttonArray.set(this.data.buttonArray);
  this.data.selected = selected;
  this.data.buttonArray = buttonArray;
  actualizeButtons(this);
}

Template.afButtonGroup.rendered = function(){
  //actualizeButtons(this);
}

Template.afButtonGroup.events({
  'click .buttonGroup': function(e, ctx){
    if(ctx.data.selected.get()=== e.target.id){
      ctx.data.selected.set(null);
    }
    else {
      ctx.data.selected.set(e.target.id);
    }
    actualizeButtons(ctx);
  }
})

Template.afButtonGroup.helpers({
   buttonsGroup: function(){

      return this.buttonArray.get();
   }
})