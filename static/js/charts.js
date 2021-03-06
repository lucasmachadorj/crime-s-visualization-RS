var width = 1200,
    height = 600,
    radius = Math.min(width, height) / 2;

var b = { w: 300, h: 30, s: 3, t: 10};

var vis;

var colors = {
  "1":"#2824A5",
  "2":"#26408E",
  "3":"#2468A5",
  "4":"#22839B",
  "5":"#20838C",

};

var yearsA = {
    "2002": "#5F449B",
    "2003": "#5F449B",
    "2004": "#5F449B",
    "2005": "#5F449B",
    "2006": "#5F449B",
}

var yearsB = {
    "2007": "#5F449B",
    "2008": "#5F449B",
    "2009": "#5F449B",
    "2010": "#5F449B",
    "2011": "#5F449B",
    "2012": "#5F449B",
}

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;


function loaddata(text){
    d3.text("static/js/data/path"+ text + ".csv", function(d){
        var csv = d3.csv.parseRows(d);
        var json = buildHierarchy(csv);
        createVisualization(json);
    });
}

loaddata("2002");

function createVisualization(json) {

    d3.select("body").append("div")
        .attr("id", "title")
        .append("h1")
        .style("text-align", "center")
        .text("Indicativos de Crimes");

    d3.select("body").append("div")
        .attr("id", "sequence");


    d3.select("body").append("div")
        .attr("id", "sidebarA")
        .append("div").attr("id", "legendA");

    d3.select("body").append("div")
        .attr("id", "main")
        .append("div")
        .attr("id", "chart")
        .append("div")
        .attr("id","explanation")
        .style("visibility","hidden")
        .append("span")
        .attr("id", "percentage");


    d3.select("body").append("div")
        .attr("id", "sidebarB")
        .append("div").attr("id", "legendB");



    var li = { w: 75, h: 130, s: 3, r: 3};

    var legendA = d3.select("#legendA").append("svg:svg")
        .attr("width", li.w)
        .attr("height", d3.keys(yearsA).length * (li.h + li.s));

    var legendB = d3.select("#legendB").append("svg:svg")
        .attr("width", li.w)
        .attr("height", d3.keys(yearsA).length * (li.h + li.s));


    var gA = legendA.selectAll("g")
        .data(d3.entries(yearsA))
        .enter().append("svg:g")
        .attr("transform", function(d, i){
            return "translate(0," + i * (li.h + li.s) + ")";
        }).on("click", function(d){
            d3.select("#title").remove();
            d3.select("#sequence").remove();
            d3.select("#sidebarA").remove();
            d3.select("#main").remove();
            d3.select("#sidebarB").remove();
            loaddata(d.key);

        });

    var gB = legendB.selectAll("g")
        .data(d3.entries(yearsB))
        .enter().append("svg:g")
        .attr("transform", function(d, i){
            return "translate(0," + i * (li.h + li.s) + ")";
        }).on("click", function(d){
            d3.select("#title").remove();
            d3.select("#sequence").remove();
            d3.select("#sidebarA").remove();
            d3.select("#main").remove();
            d3.select("#sidebarB").remove();
            console.log(d.key);
            loaddata(d.key);

        });

    gA.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) { return d.value; });

    gB.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) { return d.value; });

    gA.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.key });

    gB.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.key });

    vis = d3.select("#chart").append("svg:svg")
    .attr("id", "vis")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id","container")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    var partition = d3.layout.partition()
        .sort(null)
        .size([2 * Math.PI, radius * radius])
        .value(function(d) { return d.size });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return d.x; })
        .endAngle(function(d) { return d.x + d.dx; })
        .innerRadius(function(d) { return Math.sqrt(d.y); })
        .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

    initializeBreadcrumbTrail();

    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    var nodes = partition.nodes(json)
        .filter(function(d){
            return (d.dx > 0.003)
        });

    var path = vis.selectAll("path").data(nodes)
        .enter().append("svg:path")
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .attr("class", "line")
        .style("fill", function(d) {
            return colors[d.depth];
        })
        .style("opacity", 1)
        .on("mouseover", mouseover);

    d3.select("#container").on("mouseleave", mouseleave);
    totalSize = path.node().__data__.value;

}

function mouseleave(d){
    d3.select("#trail")
        .style("visibility", "hidden");

    d3.selectAll("path").on("mouseover", null);

    d3.selectAll("path")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .each("end", function() {
            d3.select(this).on("mouseover", mouseover);
        });

    d3.select("#explanation")
        .style("visibility", "hidden");
}

function initializeBreadcrumbTrail(){
    var trail = d3.select("#sequence")
        .append("svg:svg")
        .attr("width", width)
        .attr("height", 50)
        .attr("id", "trail");
    trail.append("svg:text")
        .attr("id", "endlabel")
        .attr("style", "#000");

}

function mouseover(d){
    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if(percentage < 0.01)
        percentageString = "< 0.01%";

    d3.select("#percentage")
        .text(percentageString);

    d3.select("#explanation")
        .style("visibility", "");

    var sequenceArray = getAncestors(d);
    updateBreadcrumbs(sequenceArray, percentageString);

    d3.selectAll("path")
        .style("opacity", 0.3);

    vis.selectAll("path")
    .filter(function(node) {
        return (sequenceArray.indexOf(node) >= 0);
    }).style("opacity", 1);
}

function getAncestors(node){
    var path = [];
    var current = node;
    while(current.parent){
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

function breadcrumbPoints(d, i) {
    var points = [];
    points.push("0,0");
    points.push(b.w + ",0");
    points.push(b.w + b.t + "," + (b.h / 2));
    points.push(b.w + "," + b.h);
    points.push("0," + b.h);
    if (i > 0) {
        points.push(b.t + "," + (b.h / 2));
    }
    return points.join(" ");
}

function updateBreadcrumbs(nodeArray, percentageString){
    var g = d3.select("#trail")
        .selectAll("g")
        .data(nodeArray, function(d) { return d.name + d.depth; });
    var entering = g.enter().append("svg:g");
    entering.append("svg:polygon")
        .attr("points", breadcrumbPoints)
        .style("fill", function(d) { return colors[d.depth]; });

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; });

    g.attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    g.exit().remove();

    d3.select("#trail").select("#endlabel")
        .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(percentageString);

    d3.select("#trail")
        .style("visibility", "");
}



function buildHierarchy(csv){
    var root = {"name": "root", "children": []};
    for( var i = 0; i < csv.length; i++){
        var sequence = csv[i][0];
        var size = +csv[i][1];
        if(isNaN(size)){
            continue;
        }
        var parts = sequence.split("-");

        var currentNode = root;
        for( var j = 0; j < parts.length; j++){
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if(j + 1 < parts.length){
                var foundChild = false;
                for( var k = 0; k < children.length; k++){
                    if(children[k]["name"] == nodeName){
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }

                if(!foundChild){
                    childNode = {"name":nodeName, "children": []};
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                childNode = {"name": nodeName, "size": size};
                children.push(childNode);
            }
        }
    }

    return root;
};


