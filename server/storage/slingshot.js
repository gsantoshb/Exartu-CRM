
Slingshot.fileRestrictions("contactDocuments", {
  allowedFileTypes: null,
  maxSize: 20 * 1024 * 1024 // 20 MB (use null for unlimited).
});

Slingshot.createDirective("contactDocuments", Slingshot.S3Storage, {
  bucket: "exartu-bucket-0001",

  acl: "private",

  authorize: function () {
    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file) {
    // Generate ID
    var fileId = Random.id();
    return fileId.toString();
  }
});
