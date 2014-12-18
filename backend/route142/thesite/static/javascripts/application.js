var map = new Mapbox('#map');

// THIS IS A SAMPLE OF THE FORMAT OF THE DATA THAT THE BACKEND SHOULD
// RETURN WHEN WE REQUEST FOR THE PATH FROM POINT A TO POINT B
// REQUEST FORMAT:
// { from: (String) ORIGIN, to: (String) DESTINATION }
var data = [{
    type: 'road',
    start: [10.322983539725495, 123.89861583709715],
    end: [10.319985856906541, 123.89928102493286],
    traffic: 'light'
}, {
    type: 'road',
    start: [10.319985856906541, 123.89928102493286],
    end: [10.318592557986818, 123.89994621276854],
    traffic: 'light'
}, {
    type: 'road',
    start: [10.318592557986818, 123.89994621276854],
    end: [10.317473692267244, 123.89447450637819],
    traffic: 'moderate'
}, {
    type: 'road',
    start: [10.317473692267244, 123.89447450637819],
    end: [10.316270379412684, 123.89093399047852],
    traffic: 'heavy'
}, {
    type: 'road',
    start: [10.316270379412684, 123.89093399047852],
    end: [10.309894855619483, 123.89312267303467],
    traffic: 'moderate'
}, {
    type: 'school',
    coordinates: [10.322983539725495, 123.89861583709715],
    name: 'University of the Philippines Cebu',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
}, {
    type: 'landmark',
    coordinates: [10.309894855619483, 123.89312267303467],
    name: 'Fuente Osmena Circle',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
}];

function search(query) {
    request(endpoints.information_query, {
        query: query
    }, function(data) {
        map._searching = true;
        if (data.length === 1) {
            map.display(data[0])
        } else {
            map.display(data);
        }
    });
}

function path(source, destination) {
    request(endpoints.shortest_path, {
        source: source,
        destination: destination
    }, function(data) {
        map._searching = true;
        map.display(data);
    });
}