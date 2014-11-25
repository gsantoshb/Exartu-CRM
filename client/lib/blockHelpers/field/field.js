UI.registerHelper('displayProperty', function(){
  if(this.showInAdd){
    if(this.type=="field"){
      var template=Template[this.fieldType + 'FieldInput'] || Template['fieldInput'];

      if (this.fieldType == 'date') {
        template.created = function() {
          if(this.data.required && !this.data.value)
            this.data.value = new Date();
          this.data.depIsEditable = new Tracker.Dependency;
          this.data.isEditable = this.data.required;
        };
        template.isEditable = function() {
          this.depIsEditable.depend();
          return this.isEditable;
        };
        template.dateClass = function() {
          this.depIsEditable.depend();
          return this.isEditable? '' : 'disabled';
        };
        template.events({
          //todo: the dateTimePicker template accepts an onChange callback. We should pass it so we this doesn't depend on the event type or class
          'changeDate .date': getDate,
          'change .editable': function(e) {
            this.isEditable = e.target.checked;
            if(!this.isEditable)
              this.value = null;
            this.depIsEditable.changed();
          }
        });
        return template;
      }

      template.events({
        'blur input': function(e){
          switch (this.fieldType) {
            case 'lookUp':
              break; // Nothing to do here, the value is updated select2's callback onSelect
            case 'number':
              this.value=Number.parseFloat(e.target.value);
              break;
            default:
              this.value=e.target.value;
          }
          dType.isValidField(this);
        }
      });

      return template
    }
    else{
      Template['relInput'].events({
        'change select':function(e){
          this.value=e.target.value;
        }
      });
      return Template['relInput']
    }
  }
  return null;
});

var getDate=function(e, ctx){
  ctx.data.value = e.date;
  dType.isValidField(ctx.data);
};

Template.typeInput.helpers({
  isField: function (field) {
    return field.type=='field';
  }
});

Template.fieldInput.helpers({
  hasError :function(){
    return this.isValid? '': 'error';
  }
});

Template.lookUpFieldInput.helpers({
  options: function(){
    return LookUps.find({ lookUpCode: this.lookUpCode, inactive: { $ne: true } }, { sort: { displayName: 1 } }).map(function(option) {
      return {
        id: option._id,
        text: option.displayName
      }
    });
  },
  hasError :function(){
    return this.isValid ? '': 'error';
  },
  isSelected: function(value, selected){
    return value==selected;
  },
  select: function() {
    var self = this;
    return function(value){
      self.value = value;
      dType.isValidField(self);
    };
  }
});

Template.dateFieldInput.helpers({
  hasError :function(){
    return this.isValid ? '': 'error';
  },
  options: function() {
    // datepicker options
    return {
      format: "D, MM dd, yyyy",
      minViewMode: "days",
      startView: "months"
    }
  }
});

Template.relInput.rendered = function () {
  this.$('select').select2();
};

Template.relInput.helpers({
  getCustomer: function () {
    return function (string) {
      var self = this;

      //todo: calculate method
      Meteor.call('findCustomer', string, function (err, result) {
        if (err)
          return console.log(err);

        self.ready(_.map(result, function (r) {
            var text=r.organization.organizationName;
            if (r.Customer) text= text + '/' + r.Customer.department;
            text=text + '/' + r._id;
            return { id: r._id, text: text};
          })
        );
      });
    };
  },
  customerChanged: function () {
    var self= this;
    return function (value) {
      self.value = value;
    }
  },
  defaultValue: function () {
    var self = this;
    return function (cb) {
      // Check for preset customer value
      var customer = Contactables.findOne({ _id: self.value });

      if (customer) {
        cb(null, { id: customer._id, text: customer.organization.organizationName });
      } else {
        // Try to get the last customer used
        Meteor.call('getLastCustomer', function (err, result) {
          if (!err){
            cb(null, { id: result._id, text: result.organization.organizationName });
          }else{
            cb(err);
          }
        });
      }
    };
  },
  hasError :function(){
    return this.isValid? '': 'error';
  },
  isDisabled:function(){
    return ! this.editable;
  },
  isSelected: function(id){
    return (this.value || this._id) ==id;
  },
  notRequired: function(){
    return this.cardinality.min == 0;
  }
});
