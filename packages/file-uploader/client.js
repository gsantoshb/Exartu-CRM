FileUploader.post = function(endpoint, file, metadata) {
  var cb;
  if (arguments[arguments.length - 1] instanceof Function)
    cb = arguments[arguments.length - 1];

  var formData = new FormData();
  formData.append('file', file);

  var params = {
    userId: Meteor.userId(),
    loginToken: localStorage.getItem('Meteor.loginToken')
  };

  _.extend(params, metadata);

  HTTP.post(Meteor.absoluteUrl(endpoint), {
    content: formData,
    params: params
  }, function(err, result) {
    cb && cb.call({}, err, result);
  });
};

FileUploader.getUrl = function (endpoint, fileId) {
  return Meteor.absoluteUrl(endpoint + '/download/' + fileId);
};