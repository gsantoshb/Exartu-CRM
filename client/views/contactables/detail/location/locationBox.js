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
Template.contactableLocationBox.location_string = function () {

  data._dep.depend();
  if (data._location)
  return data._location.displayName;
}

var centerBox = function (box) {
  var $box=$(box),
    boxHeight= $box.outerHeight(),
    boxTop= $box.offset().top,
    boxBottom= boxTop + boxHeight,

    $win= $(window),
    winTop= $win.scrollTop(),
    winHeight = $win.height(),
    winBottom= winTop + winHeight;

  if (winBottom < boxBottom){
    $('html, body').animate({
      scrollTop: winTop + (boxBottom - winBottom)
    }, 800);
  }
}
Template.contactableLocationBox.events({
  'click .findLocation': function (e, ctx) {
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({
      address: $('#locationInput')[0].value
    }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        GAnalytics.event("/contactable", "Set location success");
        data.location = Utils.getLocation(results[0]);
        centerBox(ctx.$('.box')[0]);
      } else {
        GAnalytics.event("/contactable", "Set location fail");
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
      Deps.flush()
      centerBox(ctx.$('.box')[0]);
      ctx.$('input').focus();
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

Template.contactableLocationBox.created=function(){
  EditLocationMode.value=false;
}

var geocode= function(location){
  var geocoder = new google.maps.Geocoder;
  geocoder.geocode({
    address: location.address + ', ' + location.postalCode
  }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      GAnalytics.event("/contactable", "Set location success");
      Contactables.update({_id: Session.get('entityId')}, {$set: { location: Utils.getLocation(results[0]) } });
    } else {
      GAnalytics.event("/contactable", "Set location fail");
      data.location = null;
    }
  })
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

  var loc;
  if (EditLocationMode.value) {
    loc = data.location;
  } else {
    loc = Contactables.findOne({_id: Session.get('entityId')}).location
  }
  if (loc && !loc.lat){
    geocode(loc);
  }

  $map.resize(_.debounce(function () {
    if (google && map)
      google.maps.event.trigger(map, 'resize');
  }, 300))
}
