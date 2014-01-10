/*
 * Model helpers
 */

addSystemMetadata = function (item, user) {
	item.userId = user._id;
	item.hierId = user.hierId;
}