// Dimensions of sunburst.
var width = 1200,
    height = 600,
    radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = { w: 300, h: 30, s: 3, t: 10};

// Mapping of step names to colors.
// Mapping of step names to colors.
var colors = {
  "mes": "#a173d1",
  "mesorregiao": "#5687d1",
  "microrregiao": "#7b615c",
  "fato": "#de783b",

  // "janeiro":
};

var yearsA = {
    "2002": "#a173d1",
    "2003": "#a173d1",
    "2004": "#a173d1",
    "2005": "#a173d1",
    "2006": "#a173d1",
}

var yearsB = {
    "2007": "#a173d1",
    "2008": "#a173d1",
    "2009": "#a173d1",
    "2010": "#a173d1",
    "2011": "#a173d1",
    "2012": "#a173d1",
}

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id","container")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

d3.text("static/js/path.csv", function(text){
    var csv = d3.csv.parseRows(text);
    var json = buildHierarchy(csv);
    console.log(json);
    createVisualization(json);
});

function createVisualization(json) {
    initializeBreadcrumbTrail();
    drawLegend();


    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    var nodes = partition.nodes(json)
        .filter(function(d){
            return (d.dx > 0.005)
        });

    var path = vis.data([json]).selectAll("path")
        .data(nodes)
        .enter().append("svg:path")
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function(d) {
            console.log(d.name)
            return colors[d.name];
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
        .style("fill", function(d) { return colors["mes"]; });

    entering.append("svg:text")
        .attr("x", (b.w + b.t) / 2)
        .attr("y", b.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; });

    g.attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
    });

    // Remove exiting nodes.
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

function drawLegend(){
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
        });


    var gB = legendB.selectAll("g")
        .data(d3.entries(yearsB))
        .enter().append("svg:g")
        .attr("transform", function(d, i){
            return "translate(0," + i * (li.h + li.s) + ")";
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
