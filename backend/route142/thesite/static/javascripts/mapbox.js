// LIMIT MAP BOUNDARIES TO CEBU ISLAND ONLY
var southWest = L.latLng(9.394871245232979, 123.277587890625);
var northEast = L.latLng(11.35348957008566, 124.134521484375);
var mapBounds = L.latLngBounds(southWest, northEast);

function Mapbox(selector) {
    var element = document.querySelector(selector);
    this._map = L.mapbox.map(element, 'arnelleablane.kd50de5h', {
        accessToken: 'pk.eyJ1IjoiYXJuZWxsZWFibGFuZSIsImEiOiI2QW5EWXRjIn0.CH2zHC1Stgj5-vXXfPzmgQ',
        maxBounds: mapBounds,
    });
    this._map.setZoom(20);

    var self = this;
    this.on = this._map.on;
    this._features = [];
    this._extras = [];
    this._searching = false;
    this._gathering = true;
    this._extended_marker = null;
    this._extension_polyline = null;

    if (this._gathering) {
        this._endpoints = [];
    }

    this._map.on('moveend', function(e) {
        if (!self._searching) {
            self.populate.call(self);
        }
    });

    $(document).on('keyup', function(e) {
        if (e.keyCode === 27) {
            if (self._extended_marker) {
                self._map.removeLayer(self._extension_polyline);
                self._extended_marker = null;
                self._extension_polyline = null;
            }
            self._searching = false;
            self.populate.call(self);
        }
    });

    this._map.on('mousemove', function(e) {
        if (self._extension_polyline) {
            self._extension_polyline.setLatLngs([self._extended_marker.getLatLng(), e.latlng]);
        }
    });

    if (this._gathering) {
        this._map.on('click', function(e) {
            if (self._extension_polyline) {
                var target = null;
                for (var i = 0; i < self._endpoints.length; i++) {
                    if (e.latlng.distanceTo(self._endpoints[i].getLatLng()) < 1) {
                        target = self._endpoints[i];
                        break;
                    }
                }
                request(endpoints.path_creator, { source_id: self._extended_marker.id, destination_id: target.id }, function() {
                    self.populate();
                });
                self._map.removeLayer(self._extension_polyline);
                self._extended_marker = null;
                self._extension_polyline = null;
            }
        });
    }
}

Mapbox.prototype.center = function(coordinates) {
    this._map.setView(coordinates, 16);
};

Mapbox.prototype.fit = function(bounds) {
    this._map.fitBounds(bounds);
};

Mapbox.prototype.clear = function() {
    for (var i in this._features) {
        this._map.removeLayer(this._features[i]);
    }
    for (var i in this._endpoints) {
        this._map.removeLayer(this._endpoints[i]);
    }
    for (var i in this._extras) {
        this._map.removeLayer(this._extras[i]);
    }
    this._features = [];
    this._endpoints = [];
};

Mapbox.prototype.populate = function() {
    var self = this;
    var bounds = this._map.getBounds();
    var northwest = bounds.getNorthWest();
    var southeast = bounds.getSouthEast();
    bounds = { northwest: [northwest.lat, northwest.lng], southeast: [southeast.lat, southeast.lng] };
    request(endpoints.bounded_query, bounds, function(data) {
        self.display(data);
    });
};

Mapbox.prototype.road = function(data) {
    var road = L.polyline([data.start, data.end], { color: traffic_indicator_color(data.traffic) });
    var start = L.circle(data.start, 1);
    var end = L.circle(data.end, 1);

    if (this._gathering) {
        this._endpoints.push(start);
        this._endpoints.push(end);
        start.id = data.source_id;
        end.id = data.destination_id;
    }

    start.on('mouseover', circle_in);
    end.on('mouseover', circle_in);
    start.on('mouseout', circle_out);
    end.on('mouseout', circle_out);

    var self = this;
    function circle_in(e) {
        if (self._extension_polyline) {
            self._extension_polyline.setStyle({ color: 'green' });
        }
    }

    function circle_out(e) {
        if (self._extension_polyline) {
            self._extension_polyline.setStyle({ color: 'red' });
        }
    }

    this._map.addLayer(road);
    return road;
};

Mapbox.prototype.establishment = function(data, force_popup) {
    var marker = L.marker(data.coordinates, { icon: marker_icon(data.type) });
    marker.id = data.id;

    var popup = L.popup({ 
        closeButton: false, 
        closeOnClick: false, 
        offset: [0, -22], 
        className: 'mapbox-popup'
    }).setContent(data.name);
    this._extras.push(popup);

    if (params(force_popup, false)) {
        popup.setLatLng(marker.getLatLng());
        this._map.addLayer(popup);
    } else {
        marker.bindPopup(popup);
        marker.on('mouseover', function() {
            marker.openPopup();
        });
        marker.on('mouseout', function() {
            marker.closePopup();
        });

        if (this._gathering) {
            var self = this;
            marker.on('click', function() {
                self._extended_marker = marker;
                self._extension_polyline = L.polyline([marker.getLatLng()], { color: 'red', lineCap: 'butt' });
                self._map.addLayer(self._extension_polyline);
            });
        }
    }
    this._map.addLayer(marker);
    return marker;
};

Mapbox.prototype.display = function(data, force_popup, clear, fit) {
    force_popup = params(force_popup, false);
    if (params(clear, true)) {
        this.clear();
    }
    if (data instanceof Array) {
        this._features = [];
        for (var i = 0; i < data.length; i++) {
            var object = data[i];
            if (object.type === 'road') {
                var road = this.road(object);
                this._features.push(road);
            } else {
                var marker = this.establishment(object, force_popup);
                this._features.push(marker);
            }
        }
        var features = L.featureGroup(this._features);
        if (params(fit, false)) {
            this.fit(features.getBounds());
        }
    } else if (data instanceof Object) {
        var marker = this.establishment(data, force_popup);
        this._features.push(marker);
        this.center(data.coordinates);
    }
};

// SOME UTILITY FUNCTIONS
function traffic_indicator_color(traffic) {
    if (traffic === 'light') {
        return 'green';
    } else if (traffic === 'moderate') {
        return 'orange';
    } else if (traffic === 'heavy') {
        return 'red';
    }
    return 'white';
}

function request(url, data, callback) {
    $.ajax({
        url: url,
        method: 'GET',
        data: { data: JSON.stringify(data) },
        success: function(data) {
            data = JSON.parse(data);
            if (typeof callback === 'function') {
                callback(data);
            }
        }
    });
}

function marker_icon(type) {
    var filename = 'default.png';
    if (type === 'hospital') {
        filename = 'hospital.png';
    } else if (type === 'fire_station') {
        filename = 'firestation.png';
    } else if (type === 'townhall') {
        filename = 'office_agency.png';
    }
    var url = assets + 'images/markers/' + filename;
    return L.icon({
        iconUrl: url,
        iconRetinaUrl: url,
        iconSize: [32, 37],
        iconAnchor: [16, 32],
        popupAnchor: [0, -22]
    });
}

function params(param, normal) {
    return param === undefined ? normal : param;
}