UI.registerHelper('userInfo', function() {
  if (!this.userId)
    return;
  var user = Meteor.users.findOne({_id: this.userId});

  UsersFS.getThumbnailUrlForBlaze(user.profilePictureId, user);

  this.info = {
    username: user.username,
    picture: user.picture
  };

  return Template.user_info_template;
});

UI.registerHelper('formattedDate', function() {
   switch(this.format){
       case 'fromNow':
           this.date=moment(this.value).fromNow();
           break;
       default:
           this.date = moment(this.value).format(this.format || 'lll');

   }
  return Template.formatted_date;
});

UI.registerHelper('objectProperty', function() {
  var self = this;
  var template = {};
  switch(self.property.type) {
    case Utils.ReactivePropertyTypes.array:
//      if (self.editable !== undefined) {
//        template = Template.object_property_multiple_editable;
//        template.isEditable = function() {
//          return self.editable;
//        }
//      }else{
        template = Template.object_property_multiple;
//      }
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
        this.property.error.dep.depend();
        return this.property.error.hasError? this.property.error.message : '';
      };
  }

  return template;
});
Template.object_property_lookup.events = {
  'change select': function(e, ctx) {
    ctx.data.property.value = e.target.value;
  }
};


Template.object_property_date.events = {
  'change.dp .dateTimePicker': function(e, ctx) {
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

//Template.object_property_multiple_editable.events={
//  'click button': function(e, ctx){
//    if(ctx.$('input').val()){
//      debugger;
//      ctx.data.property.value.push(ctx.$('input').val());
//    }
//  }
//}


Template.fileProgress.progress = function() {
  if (!this)
    return;
  return this.uploadProgress();
};

Template.dropzone_template.events = {
  "dragenter": function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).addClass('drop-zone-hover');
  },
  "dragexit": function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).removeClass('drop-zone-hover');
  },
  "dragover": function (e) {
    e.stopPropagation();
    e.preventDefault();
  },
  "drop": function (e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;

    //for (var i = 0, f; f = files[i]; i++) {
    //  console.log('file dropped!');
    //  this.onDrop(f);
    //}
    // TODO: support drop multiple files
    if (files[0])
      this.onDrop(files[0]);
  }
};

UI.registerHelper('dragAndDrop', function() {
  return Template.dropzone_template;
});

// Dynamic reactive object

Template.typeInput.helpers({
  isField: function (field) {
    return field.type=='field';
  }
})

//<editor-fold desc="***********************  fieldInput *********************">
Template.fieldInput.helpers({
  hasError :function(){
    return this.isValid? '': 'error';
  }
})
Template.lookUpFieldInput.helpers({
  options: function(){
//        debugger;
    return LookUps.find({codeType: this.lookUpCode});
  },
  hasError :function(){
    return this.isValid? '': 'error';
  }
})
//</editor-fold>

//<editor-fold desc="***********************  relInput *********************">
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
})
//</editor-fold>

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
})

UI.registerHelper('dateTimePicker', function() {

    var template=Template.dateTimePickerTemp;

    template.rendered= function(){
        this.$('.dateTimePicker').datetimepicker({
            language: 'en',
            defaultDate: this.data.value,
            useSeconds: false
        })
    };

    return template;
});

UI.registerHelper('htmlEditor', function() {
  var template=Template.htmlEditorTemplate;

  template.rendered= function(){
    var editor=this.$('.editor');
    editor.wysihtml5({
      "color": true,
      "size": 'xs',
      "events": {
        "change": _.bind(function () {
          editor.trigger('change',editor.val());
        },this)
      },
    });

    editor.val(this.data.value);
    editor.width('90%');
  };

  return template;
});

UI.registerHelper('infinityScroll', function() {
  var height = $(window).height();
  var scrollTop = $(window).scrollTop();
  var cb = this.cb;

  if(height==scrollTop){
    cb();
  }
  var windowElement=$(window);
  windowElement.bind("scroll", _.debounce(function(){
    if(windowElement.scrollTop() + windowElement.height() > $(document).height() - 50){
      cb();
    }
  },300));

  return null;
});
UI.registerHelper('showAsHTML', function() {
  Template.showAsHTMLTemplate.rendered=function(){
    var container=this.$('div')
    container[0].innerHTML=this.data.value;
  }
  return Template.showAsHTMLTemplate
});
