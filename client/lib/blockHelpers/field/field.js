UI.registerHelper('displayProperty', function(){
  if(this.showInAdd){
    if(this.type=="field"){
      var template=Template[this.fieldType + 'FieldInput'] || Template['fieldInput'];

      template.events({
        'blur input': function(e){
          switch (this.fieldType) {
            case 'number':
              this.value=Number.parseFloat(e.target.value);
              break;
            case 'date':
              this.value=new Date(e.target.value);
              break;
            default:
              this.value=e.target.value;
          }
          dType.isValidField(this);
        },
        'change select':function(e){
          this.value=e.target.value;
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
      })
      return Template['relInput']
    }
  }
  return null;
});

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
    return LookUps.find({codeType: this.lookUpCode});
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