EditLocationMode = {
  val: false,
  dep: new Deps.Dependency,
  show: function () {
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};

Object.defineProperty(EditLocationMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function (newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

Template.contactableLocationBox.editMode = function () {
  return EditLocationMode.value;
}

Template.contactableLocationBox.editModeColor = function () {
  return EditLocationMode.value ? '#008DFC' : '';
}

var data = {
  _location: null,
  _dep: new Deps.Dependency
}
Object.defineProperty(data, "location", {
  get: function () {
    this._dep.depend();
    return this._location;
  },
  set: function (newValue) {
    this._location = newValue;
    this._dep.changed();
  }
});
Template.contactableLocationBox.editLocation = function () {
  return data.location;
}

var centerBox = function (box) {
  $('html, body').animate({
    scrollTop: $(box).offset().top
  }, 2000);
}
Template.contactableLocationBox.events({
  'click .findLocation': function () {
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({
      address: $('#locationInput')[0].value
    }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        data.location = getLocation(results[0]);
        console.log(data.location.displayName)
      } else {
        data.location = null;
      }
    })
  },
  'click #edit-Location': function (e, ctx) {
    if (EditLocationMode.value) {
      EditLocationMode.hide();
    }
    else {
      data.location = Contactables.findOne({_id: Session.get('entityId')}).location;
      EditLocationMode.show();
      centerBox(ctx.$('.box')[0]);
    }
  },
  'click #save-location': function () {
    Contactables.update({ _id: this._id }, { $set: { location: data._location } });
    EditLocationMode.value = false;
  },
  'click #cancel-location': function () {
    EditLocationMode.value = false;
  }
})

var getLocation = function (googleLocation) {
  return {
    displayName: googleLocation.formatted_address,
    lat: googleLocation.geometry.location.lat(),
    lng: googleLocation.geometry.location.lng()
  }
}
Template.contactableLocationBox.rendered = function () {

  var map = null;
  var marker = null;
  var infowindow = null
  var $map = this.$('.map');
  var $notFound = this.$('.map-notFound');
  var showMap = function (display) {
    if (display) {
      $map.show();
      $notFound.hide();
    } else {
      $map.hide();
      $notFound.show();
    }
  }
  var mapUpdate = function () {
    $map = this.$('.map')
    //hack find a way to stop running this
    if (!$map[0])
      return;

    var location
    if (EditLocationMode.value) {
      location = data.location;
    } else {
      location = Contactables.findOne({_id: Session.get('entityId')}).location
    }
    if (location) {
      showMap(true)
      var LatLng = new google.maps.LatLng(location.lat, location.lng);

      if (!map) {
        var element = $('.map')[0];
        var mapOptions = {
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(element, mapOptions);

      }
      map.setCenter(LatLng);

      marker = new google.maps.Marker({
        map: map,
        position: LatLng,
        title: location.dsiplayName
      });
      infowindow = new google.maps.InfoWindow({
        content: '<div>' + '<h4>' + location.displayName + '</h4>' + '</div>',
        maxWidth: 200
      });

      google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
      });
    } else {
      showMap(false)
    }
  }
  Meteor.autorun(mapUpdate);
  $map.resize(_.debounce(function () {
    if (google && map)
      google.maps.event.trigger(map, 'resize');
  }, 300))
}
