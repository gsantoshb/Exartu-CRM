Template.locationSearchInput.rendered = function () {
  var self = this;

  var inputElement = self.$('.locationSearchInput')[0];

  var autocomplete = new google.maps.places.Autocomplete(inputElement, {types: ['geocode']});
  // When the user selects an address from the dropdown this event is raised
  google.maps.event.addListener(autocomplete, 'place_changed', function () {
    var place = autocomplete.getPlace();
    //Convert the place from google to our address and call the callback
    self.data.onChange(placeToAddress(place));

  });
  //gets an object containing the address data from the autocomplete place result
  var placeToAddress = function (place) {
    var address = {};
    var componentForm = {
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      country: 'long_name',
      postal_code: 'short_name'
    };
    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
      var componentType = place.address_components[i].types[0];
      if (componentForm[componentType]) {
        var val = place.address_components[i][componentForm[componentType]];
        switch (componentType) {
          case 'street_number':
            address.address = val;
            break;
          case 'route':
            address.address = address.address + ' ' + val;
            break;
          case 'locality':
            address.city = val;
            break;
          case 'administrative_area_level_1':
            address.state = val;
            break;
          case 'country':
            address.country = val;
            break;
          case 'postal_code':
            address.postalCode = val;
            break;
        }
      }
    }

    address.lat = place.geometry.location.lat();
    address.lng = place.geometry.location.lng();
    return address;
  };
};
