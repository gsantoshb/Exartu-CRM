
AutoForm.addInputType('afSimpleCheckbox', {
  template: 'afSimpleCheckbox',
  valueOut: function () {
    return !!this[0].reactiveCheck.get();
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

Template.afSimpleCheckbox.events({
   'change input': function(e, ctx){
     e.target.reactiveCheck.set(e.target.checked);
   }
})

Template.afSimpleCheckbox.rendered = function(){
  var check =  this.$("#checkBox");
  var reactiveCheck = new ReactiveVar(check.is(":checked"));
  check[0].reactiveCheck = reactiveCheck;

}



AutoForm.addInputType('afButtonGroup', {
  template: 'afButtonGroup',
  valueOut: function (ctx) {

    return this.val();
  },
  contextAdjust: function(data){
    if(!data.atts.id){
      data.atts.id = Meteor.uuid();
    }
    data.buttonArray = data.atts.buttonArray;
    delete data.atts.buttonArray;
    var selected = new ReactiveVar();
    var buttonArray = new ReactiveVar();
    data.atts.value = data.value;
    selected.set(data.value);
    buttonArray.set(data.buttonArray);
    data.selected = selected;
    data.buttonArray = buttonArray;
    //actualizeButtons(ctx);
    return data;
  }
})

Template.afButtonGroup.events({
  'click .buttonGroup': function(e, ctx){
    var v = null;
    if(ctx.data.selected.get()=== e.target.id){

      ctx.data.selected.set(null);
    }
    else {
      v = e.target.id;
      ctx.data.selected.set(e.target.id);
    }
    var elem = ctx.$('#'+ctx.data.atts.id);
    elem.val(v);
    elem.change();
  }
})

Template.afButtonGroup.helpers({
   buttonsGroup: function(){
       return Template.instance().data.buttonArray.get();
   },
  class: function () {
    if(this.value === Template.instance().data.selected.get()){
      return "btn btn-sm btn-primary";
    }
    else{
      return "btn btn-sm btn-default";
    }
  },
   selected: function(){
      //debugger;
      //return Template.instance().data.selected.get();
   }
})



AutoForm.addInputType('afSearch', {
  template: 'afSearch',
  valueOut: function (ctx) {
    return this.val();
  },
  contextAdjust: function(data){
   if(!data.atts.id){
      data.atts.id = Meteor.uuid();
    }
    data.getCollection = data.atts.getCollection;
    data.selectionChanged = data.atts.selectionChanged;
    delete data.atts.getCollection;
    delete data.atts.selectionChanged;
    //var selected = new ReactiveVar();
    //var buttonArray = new ReactiveVar();
    //data.atts.value = data.value;
    //selected.set(data.value);
    //buttonArray.set(data.buttonArray);
    //data.selected = selected;
    //data.buttonArray = buttonArray;
    //actualizeButtons(ctx);
    return data;
  }
})

Template.afSearch.helpers({
  'getCollection': function () {
    return this.getCollection.getCollection;
  },
  'selectionChanged': function () {
    var self = this;
    return function(string){
      self.selectionChanged.selectionChanged(string);
      var elem = $('#'+self.atts.id);
      elem.val(string);
      elem.change();
    };
  }
})