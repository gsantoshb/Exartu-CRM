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


UI.registerHelper('dateTimePicker', function() {
    return Template.dateTimePicker;
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

UI.registerHelper('showAsHTML', function() {
  Template.showAsHTMLTemplate.rendered=function(){
    var container=this.$('div')
    container[0].innerHTML=this.data.value;
  }
  return Template.showAsHTMLTemplate
});
