var map, infoWindow, geocoder;
var service_bodies = [];
var root = "https://archsearch.org/main_server/";

$(function() {
    $.getJSON(root + "client_interface/jsonp/?switcher=GetServiceBodies&callback=?", function(data) {
        service_bodies = data;
    });

    var pusher = new Pusher('31e15996ab4768aa41b5', {
        cluster: 'us2',
        forceTLS: true
    });

    var channel = pusher.subscribe('yap-viz');

    channel.bind('helpline-search', function(data) {
        setMapInfo({
            "lat": data["latitude"],
            "lng": data["longitude"]
        });
    });
});

function getServiceBodyForCoordinates(latitude, longitude, callback) {
    $.getJSON(root + "/client_interface/jsonp/?switcher=GetSearchResults&geo_width=-10&long_val=" + longitude + "&lat_val=" + latitude + "&callback=?", function (data) {
        callback(data);
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
    infoWindow = new google.maps.InfoWindow;
    getcoder = new google.maps.Geocoder;
}

function setMapInfo(pos) {
    infoWindow.setPosition(pos);
    getServiceBodyForCoordinates(pos.lat, pos.lng, function(data) {
        var serviceBodyDetails = getServiceBodyById(data[0]["service_body_bigint"]);
        var content = "<b>" + serviceBodyDetails["name"] + "</b>";
        content += "<br>Website: <a href='" + serviceBodyDetails["url"] + "' target='_blank'>" + serviceBodyDetails["url"] + "</a>";
        content += "<br>Helpline: <a href=tel:'" + serviceBodyDetails["helpline"].split("|")[0] + "' target='_blank'>" + serviceBodyDetails["helpline"].split("|")[0] + "</a>";
        content += "<br>Root Server: <a href='" + data[0]["root_server_uri"] + "' target='_blank'>" + data[0]["root_server_uri"] + "</a>";
        infoWindow.setContent(content);
        infoWindow.open(map);
        map.setCenter(pos);
    });
}

function getServiceBodyById(id) {
    for (var service_body of service_bodies) {
        if (service_body["id"] === id) return service_body;
    }
}
