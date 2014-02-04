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

filterByHiers = function (hier) {
	var accumulated = '';
	var ors = [];
	_.each(hier.split('-'), function (part) {
		accumulated = accumulated + (accumulated ? '-' : '') + part;
		ors.push({
			hierId: {
				$regex: '^' + accumulated + '$'
			}
		})
	})
	ors.push({
		hierId: {
			$regex: '^' + hier + '.*'
		}
	});
    console.log('ors',ors);
    console.log('accumulated', accumulated);

	return ors;
}