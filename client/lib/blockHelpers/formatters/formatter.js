UI.registerHelper('formattedDate', function() {
  switch(this.format){
    case 'fromNow':
      this.date=moment(this.value).fromNow();
      break;
    default:
      this.date = moment(this.value).format(this.format || 'll');

  }
  return Template.formatted_date;
});

UI.registerHelper('htmlEditor', function() {
  var template=Template.htmlEditorTemplate;

  template.rendered= function(){
    var editor=this.$('.editor');

    editor.wysihtml5({
      "color": true,
      "size": 'xs',
      'html': true,
      "events": {
        "change": _.bind(function () {
          editor.trigger('change',editor.val());
        },this)
      },
    });

    editor.val(this.data.value);
    editor.width('90%');
  }
  template.destroyed = function() {
    // Hide editor
    $('.editor').data('wysihtml5').editor.composer.hide();
    $('.editor').data('wysihtml5').editor.toolbar.hide();
  }

  return template;
});

UI.registerHelper('showAsHTML', function() {
  Template.showAsHTMLTemplate.rendered=function(){
    var container=this.$('div')
    container[0].innerHTML=this.data.value;
  }
  return Template.showAsHTMLTemplate
});

Template.showAsHTMLTemplate.previewClass=function(){
  if (this.previewMode){
    return 'mobilePreview'
  }
  return ''
}

UI.registerHelper('dateTimePicker', function() {
  return Template.dateTimePicker;
});

Template.dateTimePicker.rendered= function() {
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

Template.dateTimePicker.getInitialValue = function () {
  if (!this.value)
    return;

  return this.options && this.options["moment-format"]? moment(this.value || new Date()).format(this.options["moment-format"].toUpperCase()) : this.value
};

Template.dateTimePicker.events({
  'dp.change .datetimepicker':function (e, ctx) {
    if (ctx.onChange && _.isFunction(ctx.onChange)){
      ctx.onChange();
    }
  }
});