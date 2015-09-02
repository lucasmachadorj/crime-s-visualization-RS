queue()
    .defer(d3.json, "/indicativos/crimes")
    .await(makeGraphs);

function makeGraphs(error, crimesjson){
    var crimes = crimesjson;

}
