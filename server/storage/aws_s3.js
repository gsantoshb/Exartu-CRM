
AWS_S3 = {
  getSignedUrl: function (bucket, resource, region) {
    // Validate parameters
    if (!bucket) throw new Error('Bucket is required');
    if (!resource) throw new Error('Resource is required');

    // Validate AWS credentials
    if (!Meteor.settings.AWSAccessKeyId) throw new Error('AWSAccessKeyId is required in Meteor.settings');
    if (!Meteor.settings.AWSSecretAccessKey) throw new Error('AWSSecretAccessKey is required in Meteor.settings');
    if (!region && !Meteor.settings.AWSRegion) throw new Error('Region needs to be provided');

    // Config AWS S3
    var s3 = new AWS.S3({
      accessKeyId: Meteor.settings.AWSAccessKeyId,
      secretAccessKey: Meteor.settings.AWSSecretAccessKey,
      region: region || Meteor.settings.AWSRegion
    });

    var params = {Bucket: bucket, Key: resource};
    return s3.getSignedUrl('getObject', params);
  }
};
