
UI.registerHelper('formattedDate', function(date, format) {
  switch(format) {
    case 'fromNow':
      return moment(date).fromNow();
      break;
    default:
      return moment(date).format(_.isString(format) ? format : 'll');
  }
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




// Bootstrap 3 dateTimePicker
UI.registerHelper('dateTimePicker', function() {
  return Template.dateTimePicker;
});
Template.dateTimePicker.rendered = function() {
  // Default options
  var options = {
    autoclose: true,
    clearBtn: true,
    initialDate: this.data.value,
    useSeconds: false,
    pickTime: false
  };
  // Override with custom options
  _.extend(options, this.data.options);

  // Start the plugin
  this.$('.date').datetimepicker(options);
  // Set the initial date when specified
  this.$('.date').datetimepicker('update', this.data.value);
};

Template.dateTimePicker.helpers({
  dataSchemaKey: function () {
    return this.dataSchemaKey;
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

