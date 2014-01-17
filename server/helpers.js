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