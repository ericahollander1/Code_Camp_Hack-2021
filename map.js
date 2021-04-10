let map;
let places;
let infoWindow;
let markers = [];
let autocomplete;
const countryRestrict = {country: "us"};
const MARKER_PATH = "https://developers.google.com/maps/documentation/javascript/images/marker_green";

var request = 
{
    query: 'recycling',
    fields : ['name', 'geometry'],
};

const hostnameRegexp = new RegExp("^https?://.+?/")
const states = 
{
    ia: {
        center: {lat: 41.8780, lng: -93.0977},
        zoom: 7
    }
};

function initMap()
{
    var options = 
    {
      zoom: states["ia"].zoom,
      center: states["ia"].center,
      mapTypeControl: false,
      streetViewControl: false,
    }
    
    map = new google.maps.Map(document.getElementById('map'), options);

    infoWindow = new google.maps.InfoWindow();

    autocomplete = new google.maps.places.Autocomplete
    (
        document.getElementById("autocomplete"),
        {
            types: ["(cities)"],
            componentRestrictions: countryRestrict,
        }
    );

    places = new google.maps.places.PlacesService(map);
    autocomplete.addListener("place_changed", onPlaceChanged);

    document
        .getElementById("state")
        .addEventListener("change", setAutocompleteState);
  }

function onPlaceChanged() 
{
    const place = autocomplete.getPlace();

    if (place.geometry && place.geometry.location) 
    {
        map.panTo(place.geometry.location);
        map.setZoom(13);
        search(request);
    }
    else
    {
        document.getElementById("autocomplete").placeholder = "Enter a city";
    }
}

// Search for recycling centers in the city, within the viewport of the map
function search() {
    const search = {
        bounds: map.getBounds()
    }
    places.findPlaceFromQuery(request, function(results, status)
        {
            if (status === google.maps.places.PlacesServiceStatus.OK)
            {
                clearResults();
                clearMarkers();
                console.log(results);
                for (let i = 0; i < results.length; i++)
                {
                    const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
                    const markerIcon = MARKER_PATH + markerLetter + ".png";
                    markers[i] = new google.maps.Marker
                    (
                        {
                            position: results[i].geometry.location,
                            animation: google.maps.Animation.DROP,
                            icon: markerIcon,
                        }
                    );
                    
                    markers[i].placeResult = results[i];
                    google.maps.event.addListener(markers[i], "click", showInfoWindow);
                    setTimeout(dropMarker(i), i * 100);
                    addResult(results[i], i);

                }
                map.setCenter(results[0].geometry.location);
            }
        }
    );
}

function setAutocompleteState() 
{
    const state = document.getElementById("state").value;
  
    if (state == "all") 
    {
      autocomplete.setComponentRestrictions({ state: [] });
      map.setCenter({ lat: 15, lng: 0 });
      map.setZoom(2);
    } 
    else 
    {
      autocomplete.setComponentRestrictions({ state: state });
      map.setCenter(states[state].center);
      map.setZoom(states[state].zoom);
    }
    clearResults();
    clearMarkers();
  }
  
  function dropMarker(i) {
    return function () {
      markers[i].setMap(map);
    };
  }
  
  function addResult(result, i) {
    const results = document.getElementById("results");
    const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
    const markerIcon = MARKER_PATH + markerLetter + ".png";
    const tr = document.createElement("tr");
    tr.style.backgroundColor = i % 2 === 0 ? "#F0F0F0" : "#FFFFFF";
  
    tr.onclick = function () {
      google.maps.event.trigger(markers[i], "click");
    };
    const iconTd = document.createElement("td");
    const nameTd = document.createElement("td");
    const icon = document.createElement("img");
    icon.src = markerIcon;
    icon.setAttribute("class", "placeIcon");
    icon.setAttribute("className", "placeIcon");
    const name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
  }

  function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
      if (markers[i]) {
        markers[i].setMap(null);
      }
    }
    markers = [];
  }
  
  
  function clearResults() {
    const results = document.getElementById("results");
  
    while (results.childNodes[0]) {
      results.removeChild(results.childNodes[0]);
    }
  }
  
  // Get the place details for a recyling center. Show the information in an info window,
  // anchored on the marker for the hotel that the user selected.
  function showInfoWindow() {
    const marker = this;
    places.getDetails(
      { placeId: marker.placeResult.place_id },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          return;
        }
        infoWindow.open(map, marker);
        buildIWContent(place);
      }
    );
  }
  
  // Load the place information into the HTML elements used by the info window.
  function buildIWContent(place) 
  {
    document.getElementById("iw-icon").innerHTML =
      '<img class="hotelIcon" ' + 'src="' + place.icon + '"/>';
    document.getElementById("iw-url").innerHTML =
      '<b><a href="' + place.url + '">' + place.name + "</a></b>";
    document.getElementById("iw-address").textContent = place.vicinity;
  
    if (place.formatted_phone_number) 
    {
      document.getElementById("iw-phone-row").style.display = "";
      document.getElementById("iw-phone").textContent =
        place.formatted_phone_number;
    }
    else 
    {
      document.getElementById("iw-phone-row").style.display = "none";
    }
    if (place.website) 
    {
        let fullUrl = place.website;
        let website = String(hostnameRegexp.exec(place.website));
    
        if (!website) {
          website = "http://" + place.website + "/";
          fullUrl = website;
        }
        document.getElementById("iw-website-row").style.display = "";
        document.getElementById("iw-website").textContent = website;
      }
      else 
      {
        document.getElementById("iw-website-row").style.display = "none";
      }
    }


