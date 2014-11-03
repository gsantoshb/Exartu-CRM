/**
 * Template to make a async dropdown input
 * In order to use it you should include the template passing this arguments:
 * query { FUNCTION } should accept one argument, which is the string that the user typed
 *                    it can return the result, or it can call this.ready passing the result.
 *                    In either case result should be an array of objects with id and text.
 *
 * onChange{ FUNCTION } called when a new value is selected, it should receive one argument (the id of the selected option)
 *
 * placeholder { STRING (optional) }
 * minimumInputLength { Number (optional) }
 */


Template.asyncSelect.rendered = function () {
  var self = this;
  var placeholder = self.data.placeholder || "Search";
  var minimumInputLength = self.data.minimumInputLength || 1;

  if (! self.data.query || ! _.isFunction(self.data.query)) throw new Error('Template asyncSelect needs a function as query parameter');
  if ( self.data.onChange && ! _.isFunction(self.data.onChange)) throw new Error('Argument onChange of asyncSelect must be a function');

  self.$('#input').select2({
    minimumInputLength: minimumInputLength,
    initSelection: function (element, callback) {
      if (_.isFunction(self.data.defaultValue)) {
        self.data.defaultValue(function (err, result) {
          if (!err) {
            callback(result);
          }
        });
      }else{
        //todo:
      }
    },
    placeholder: placeholder,
    query: function (query) {
      var res = self.data.query.call({
        ready: function (result) {
          query.callback({
            results: result
          });
      }}, query.term);

      if (res){
        query.callback({
          results: res,
          more: true
        });
      }
    }
  });
};

Template.asyncSelect.helpers({
  defaultValue: 'asd'
});

Template.asyncSelect.events({
  'change #input': function(e, ctx) {
    ctx.data.onChange && ctx.data.onChange(e.val);
  }
});