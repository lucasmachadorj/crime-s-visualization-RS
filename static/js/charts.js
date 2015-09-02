queue()
    .defer(d3.json, "/indicativos/crimes")
    .await(makeGraphs);

function makeGraphs(error, crimesjson){
    var crimes = crimesjson;

    //cross filter instance
    var ndx = crossfilter(crimes);

    //dimensões
    var municipioDim = ndx.dimension(function(d){ return d["MUNICIPIO"]; });
    var fatoDim = ndx.dimension(function(d) { return d["FATO"]; });
    var qtdeDim = ndx.dimension(function(d) { return d["QTDE"]; });
    var anoDim = ndx.dimension(function(d) { return d["ANO"]; });
    var mesDim = ndx.dimension(function(d) { return d["MES"]; });


    //metricas calculadas
    var numCrimesPorFato = fatoDim.group(),
        numCrimesPorMunicipio = municipioDim.group(),
        numCrimesPorAno = anoDim.group();

    var all = ndx.groupAll();


};

