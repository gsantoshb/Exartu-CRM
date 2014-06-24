/*
 * jQuery.html5type - HTML5 input type
 * Written by Brant Burnett
 * Modified by Rachael L. Moore
 * Date: 2010/12/16
 * Detects original HTML5 input types even in browsers that don't support them.
 * http://btburnett.com/2010/04/detecting-html5-input-types-on-unsupported-browsers.html
 * http://www.rachaelmoore.name/web-development/javascript/jquery-plugin-html5-input-type-attr-value
 *
 * @author Brant Burnett
 * @author Rachael L. Moore
 */
(function($){
  // HTML5 Input Type
  $.fn.html5type = function(){
    var result = [];
    $.each(this, function(i, val){
      result[i] = m.checkType(this);
    });
    // One
    if(result.length == 1){
      return result[0];
    }
    // Many
    else if(result.length > 1){
      return result;
    }
    // None
    else{
      return false;
    }
  } // html5type
  // Methods
  $.fn.html5type.methods = {
    checkType: function(elm){
      // IE returns the original value in outerHTML
      var html = elm.outerHTML;
      if(typeof(html) !== 'undefined'){
        var found = html.match(/type=(\w+)/);
        if(found){
          $(elm).data("type", found[1]);
          return found[1];
        }
      } // outerHTML
      // Other browsers can test attributes collection
      var 	attrs = elm.attributes,
        i;
      for(i = 0; i < attrs.length; i++){
        if(attrs[i].nodeName === "type"){
          $(elm).data("type", attrs[i].nodeValue);
          return attrs[i].nodeValue;
        } // type
      } // for
    } // checkType
  } // html5type.methods
  var m = $.fn.html5type.methods;
})(jQuery);