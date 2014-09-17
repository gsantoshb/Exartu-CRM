/*
 * Model helpers
 */

addSystemMetadata = function (item, user) {
	item.userId = user._id;
	item.hierId = user.hierId;
}


parseJS = function (str) {
	try {
		eval("var code=" + str);
		return code;
	} catch (err) {
		console.log('error parsing jsCode: ' + str);
		console.dir(err);
	}
}

filterByHiers = function (hier, key) {
	var accumulated = '';
	var ors = [];
  var key = key || 'hierId';

	_.each(hier.split('-'), function (part) {
		accumulated = accumulated + (accumulated ? '-' : '') + part;
    var aux={};
    aux[key] = {
      $regex: '^' + accumulated + '$'
    };
		ors.push(aux)
	});
  var aux={};
  aux[key] = {
    $regex: '^' + hier + '.*'
  };
	ors.push(aux);
    //console.log('ors',ors);
    //console.log('accumulated', accumulated);

	return ors;
}