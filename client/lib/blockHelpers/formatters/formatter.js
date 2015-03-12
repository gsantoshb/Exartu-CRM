
UI.registerHelper('formattedDate', function(date, format) {
  switch(format) {
    case 'fromNow':
      return moment(date).fromNow();
      break;
    default:
      return moment(date).format(format || 'll');
  }
});

UI.registerHelper('htmlEditor', function() {
  var template=Template.htmlEditorTemplate;

  template.rendered= function(){
    var editor=this.$('.editor');

    editorInstance = editor.wysihtml5({
      "color": true,
      "size": 'xs',
      'html': true,
      parserRules: {
        "tags":{
          input: {
            keepAllAttributes: true
          }
        }
      },
      "events": {
        "change": _.bind(function () {
          editor.trigger('change',editor.val());
        },this)
      }
    });

    editor.val(this.data.value);
    editor.width('90%');
  };
  template.destroyed = function() {
    // Hide editor
    $('.editor').data('wysihtml5').editor.composer.hide();
    $('.editor').data('wysihtml5').editor.toolbar.hide();
  };

  return template;
});

UI.registerHelper('showAsHTML', function() {
  Template.showAsHTMLTemplate.rendered=function(){
    var container=this.$('div');
    container[0].innerHTML=this.data.value;
  };
  return Template.showAsHTMLTemplate
});

Template.showAsHTMLTemplate.previewClass=function(){
  if (this.previewMode){
    return 'mobilePreview'
  }
  return ''
};

UI.registerHelper('dateTimePicker', function() {
  return Template.dateTimePicker;
});

Template.dateTimePicker.rendered = function() {
  var options = {
    language: 'en',
    initialDate: this.data.value,
    useSeconds: false,
    autoclose: true
  };
  _.extend(options, this.data.options);

  if (!this.data.pickTime) {
    options.pickTime = false;
  }

  if (this.data.from){
    options.minDate= this.data.from
  }
  if (this.data.to){
    options.maxDate= this.data.to
  }

  this.$('.date').datetimepicker(options);
};

Template.dateTimePicker.helpers({
  dataSchemaKey: function () {
    return this.dataSchemaKey;
  },
  getInitialValue: function () {
    if (!this.value)
      return;

    return this.options && this.options["momentFormat"]? moment(this.value || new Date()).format(this.options["momentFormat"]) : this.value
  }
});

Template.dateTimePicker.events({
  'dp.change .datetimepicker':function (e, ctx) {
    if (ctx.onChange && _.isFunction(ctx.onChange)){
      ctx.onChange();
    }
  }
});



// Bootstrap 3 datepicker
UI.registerHelper('bootstrap3DatePicker', function() {
  return Template.bootstrap3DatePicker;
});
Template.bootstrap3DatePicker.rendered = function () {
  // Default options
  var options = {
    autoclose: true,
    clearBtn: true
  };
  // Override with custom options
  _.extend(options, this.data.options);

  // Start the plugin
  this.$('.date').datepicker(options);
  // Set the initial date when specified
  this.$('.date').datepicker('update', this.data.value);
};
Template.bootstrap3DatePicker.helpers({
  dataSchemaKey: function () {
    return this.dataSchemaKey;
  }
});



Template.showMore.helpers({
  isTooLong: function () {
    return this.limit < this.text.length;
  },
  hidden: function () {
    //sometimes the created hook is not called
    this.hidden = this.hidden || new ReactiveVar(true);

    return this.hidden.get();
  },
  shortText: function () {
      // find a good last space to break...but given the border case of text length being almost equal to 'limit'
      // back off a little from the limit
    var lastWord = this.text.indexOf(' ', this.limit-8);
    return lastWord === -1 ? this.text : this.text.substring(0, lastWord);
  }
});

Template.showMore.events({
  'click #showMore': function (e, ctx) {
    ctx.data.hidden.set(false);
  },
  'click #showLess': function (e, ctx) {
    ctx.data.hidden.set(true);
  }
});

