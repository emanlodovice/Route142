var map = new Mapbox('#map');

function search(query) {
    request(endpoints.information_query, { query: query }, function(data) {
        map._searching = true;
        if (data.length === 1) {
            map.display(data[0])
        } else {
            map.display(data, undefined, undefined, true);
        }
    });
}

function path(source, destination) {
    request(endpoints.shortest_path, { source: source, destination: destination }, function(data) {
        if (data.length) {
            map._searching = true;
            map.display(data, true, undefined, true);
        } else {
            alert('No path found.');
        }
    });
}