UI.registerHelper('objectProperty', function() {
  var self = this;
  var template = {};
  if (self.property==null)
    {
        console.log('unknown object passed to registerHelper.  did you spell the field name correctly',self);
        return null;
    }
  switch(self.property.fieldType) {
    case Utils.ReactivePropertyTypes.array:
      template = Template.object_property_multiple;
      template.values = function() {
        return this.property.value;
      };
      break;
    case  Utils.ReactivePropertyTypes.lookUp:
      template = Template.object_property_lookup;
      template.isEditable = function() {
        return self.editable;
      }
      break;
    case  Utils.ReactivePropertyTypes.date:
      template = Template.object_property_date;
      template.isEditable = function() {
        return self.editable;
      }
      break;
    case Utils.ReactivePropertyTypes.boolean:
      template = Template.object_property_checkbox;
      template.value = function() {
        return this.property.value;
      };
      break;
    default:{
      if (self.editable !== undefined) {
        template = Template.object_property_single_editable;
        template.isEditable = function() {
          return self.editable;
        }
      }
      else
        template = Template.object_property_single;
      }
      template.error = function() {
        if (_.isObject(this.property.error)){
          return this.property.error.hasError? this.property.error.message : ''
        }else{
          return this.property.error;
        }
      };
  }

  return template;
});

Template.object_property_lookup.events = {
  'change select': function(e, ctx) {
    ctx.data.property.value = e.target.value=='null'? null: e.target.value;
  }
};
Template.object_property_lookup.helpers({
  options: function(){

    //todo: create helper in utils
    return LookUps.find({lookUpCode: this.property.lookUpCode});
  },
  displayName: function(){
    if (this.property.value == null) 
      return 'Not Set';
    
    return LookUps.findOne({_id: this.property.value}) ? LookUps.findOne({_id: this.property.value}).displayName : 'Unknown';
  }
})

Template.object_property_date.events = {
  //todo: the dateTimePicker template accepts an onChange callback. We should pass it so we this doesn't depend on the event type
  'dp.change .dateTimePicker': function(e, ctx) {
      if ($(e.target).hasClass('dateTimePicker')){
            ctx.data.property.value = $(e.target).data('DateTimePicker').date.toDate();
      }
  }
};

Template.object_property_single.events = {
  'change .prop-input': function(e) {
    this.property.value = e.target.value;
  }
};

Template.object_property_single_editable.events = {
  'change .prop-input': function(e, ctx) {
    if(e.target.type=='number'){
      ctx.data.property.value = Number.parseFloat(e.target.value) || 0;
    }else{
      ctx.data.property.value = e.target.value;
    }
  }
};

Template.object_property_checkbox.events = {
  'change .prop-input': function(e, ctx) {
    ctx.data.property.value = e.target.checked;
  }
};