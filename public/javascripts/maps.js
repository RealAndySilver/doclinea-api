function initialize() {
  var myLatlng = new google.maps.LatLng(lat,lon);
  var mapOptions = {
    zoom: 9,
    center: new google.maps.LatLng(lat, lon),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var contentString = "l";
  var infowindow = new google.maps.InfoWindow({
  	content: contentString
  });
  var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
  var marker = new google.maps.Marker({
	  position: myLatlng,
	  map:map,
	  title:location.name
  });
  google.maps.event.addListener(marker, 'click', function() {
     infowindow.open(map,marker);
  });
  google.maps.event.addListener(map,'click',function(event) { 
	console.log("clicked lat "+event.latLng.lat());
	console.log("clicked lon "+event.latLng.lng());
	marker.setPosition(new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()));
		document.getElementById('lat').value = event.latLng.lat();
		document.getElementById('lon').value = event.latLng.lng();
	})
}

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaWWheSGHGGg2dPYkANw-xRJ_ce3hMm2A&v=3.exp&sensor=false&' +
      'callback=initialize';
  document.body.appendChild(script);
}

window.onload = loadScript;