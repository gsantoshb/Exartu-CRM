Template.locationMap.rendered = function () {
  var ctx = _.first(this.data);

  var map = null;
  var marker = null;
  var infowindow = null
  var $map = this.$('.map');

  var showMap = function (display) {
    if (display) {
      $map.show();
    } else {
      $map.hide();
    }
  };

  var location = ctx.location;

  var mapUpdate = function () {
    $map = this.$('.map');

    //hack find a way to stop running this
    if (!$map[0])
      return;

    showMap(true);

    var LatLng = new google.maps.LatLng(location.lat, location.lng);

    if (! map) {
      var element = $('.map')[0];
      var mapOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(element, mapOptions);

      map.setCenter(LatLng);

      marker = new google.maps.Marker({
        map: map,
        position: LatLng,
        title: location.dsiplayName
      });

      infowindow = new google.maps.InfoWindow({
        content: '<div>' + '<h4>' + Utils.getLocationDisplayName(location) + '</h4>' + '</div>',
        maxWidth: 200
      });

      google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
      });
    } else {
      showMap(false)
    }
  };

  Meteor.autorun(mapUpdate);

  // Trigger google map resize
  $map.resize(_.debounce(function () {
    if (google && map)
      google.maps.event.trigger(map, 'resize');
  }, 300))
};

Template.locationMap.events({
  'click #close': function () {
    Utils.dismissModal();
  }
});