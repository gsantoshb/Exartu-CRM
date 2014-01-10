acceptMongoAction = function (condition) {
	return condition || true;
};

denyMongoAction = function (condition) {
	return condition || false;
};