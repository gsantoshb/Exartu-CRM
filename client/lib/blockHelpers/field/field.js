UI.registerHelper('displayProperty', function(){
  if(this.showInAdd){
    if(this.type=="field"){
      var template=Template[this.fieldType + 'FieldInput'] || Template['fieldInput'];

      if (this.fieldType == 'date') {
        template.created = function() {
          if(this.data.required && !this.data.value)
            this.data.value = new Date();
          this.data.depIsEditable = new Deps.Dependency;
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
          'dp.change .dateTimePicker': getDate,
          'blur input.date': getDate,
          'change .editable': function(e) {
            this.isEditable = e.target.checked;
            if(!this.isEditable)
              this.value = null;
            this.depIsEditable.changed();
          }
        });
        return template;
      }
      //hack
      if (this.fieldType == 'lookUp'){
        var defaultLookUp =LookUps.findOne({codeType: this.lookUpCode, isDefault: true})
        if (defaultLookUp){
          this.value= defaultLookUp._id;
        }
      }

      template.events({
        'blur input': function(e){
          switch (this.fieldType) {
            case 'number':
              this.value=Number.parseFloat(e.target.value);
              break;
            default:
              this.value=e.target.value;
          }
          dType.isValidField(this);
        },
        'change select':function(e){
          this.value = e.target.value == 'null' ? null : e.target.value;
          dType.isValidField(this);
        },

      });
      return template
    }
    else{
      Template['relInput'].events({
        'change select':function(e){
          this.value=e.target.value;
        }
      })
      return Template['relInput']
    }
  }
  return null;
});

var getDate=function(e, ctx){
  this.value = ctx.$('.dateTimePicker').data('DateTimePicker').date.toDate();
  dType.isValidField(this);
}

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
    return LookUps.find({ codeType: this.lookUpCode, inactive: { $ne: true } }, { sort: { displayName: 1 } });
  },
  hasError :function(){
    return this.isValid ? '': 'error';
  },
  isSelected: function(value, selected){
    return value==selected;
  }
});

Template.dateFieldInput.helpers({
  hasError :function(){
    return this.isValid ? '': 'error';
  }
});

Template.relInput.helpers({
  options: function(){
    var q={};
    q[this.target]={ $exists: true };
    //todo: get collection from this.collection
    return Contactables.find(q);
  },
  hasError :function(){
    return this.isValid? '': 'error';
  },
  isDisabled:function(){
    return ! this.editable;
  },
  isSelected: function(id){
    return (this.value || this._id) ==id;
  }
});