// Dimensions of sunburst.
var width = 750,
    height = 600,
    radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = { w: 75, h: 30, s: 3, t: 10};

// Mapping of step names to colors.
// Mapping of step names to colors.
var colors = {
  "mes": "#a173d1",
  "mesorregiao": "#5687d1",
  "microrregiao": "#7b615c",
  "fato": "#de783b",
};

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
});


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
