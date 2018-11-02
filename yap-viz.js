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
        }, JSON.stringify(data));
    });
});

function getServiceBodyForCoordinates(latitude, longitude, callback) {
    $.getJSON(root + "/client_interface/jsonp/?switcher=GetSearchResults&sort_results_by_distance=1&geo_width=-10&long_val=" + longitude + "&lat_val=" + latitude + "&callback=?", function (data) {
        callback(data);
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.2919667, lng: -96.151288},
        zoom: 8,
    });
    infoWindow = new google.maps.InfoWindow;
    getcoder = new google.maps.Geocoder;
}

function setMapInfo(pos, location) {
    infoWindow.setPosition(pos);
    getServiceBodyForCoordinates(pos.lat, pos.lng, function(data) {
        var serviceBodyDetails = getServiceBodyById(data[0]["service_body_bigint"]);
        var content = "<b>" + serviceBodyDetails["name"] + "</b>";
        content += "<br>Caller Location Request: " + location;
        content += "<br>Helpline: <a href='tel:" + serviceBodyDetails["helpline"].split("|")[0] + "' target='_blank'>" + serviceBodyDetails["helpline"].split("|")[0] + "</a>";
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
