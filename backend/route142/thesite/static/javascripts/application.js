var map = new Mapbox('#map');

function search(query) {
    request(endpoints.information_query, {
        query: query
    }, function(data) {
        map._searching = true;
        if (data.length === 1) {
            map.display(data[0])
            console.log(data[0].id);
            $("#search form #source_").val(data[0].id);
            $("#search form #source_name").val(data[0].name);
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
        map.display(data, true, undefined, true);
    });
}