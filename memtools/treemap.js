var node, svg;
function showTreeMap(root, width, height) {
//http://mbostock.github.io/d3/talk/20111018/treemap.html

  var treemap = d3.treemap()
    .size([width, height])
    .tile(d3.treemapResquarify)
    (root.sum(a => a.size).sort((a, b) => b.size - a.size));//

  svg = d3.select("#treemap")
    .attr("class", "chart")
    .style("width", width + "px")
    .style("height", height + "px")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("transform", "translate(.5,.5)");

  node = root;
  var nodes = treemap.descendants().filter(function(d) {
      return !d.children;
    });

  var cell = svg.selectAll("g")
    .data(nodes)
    .enter().append("svg:g")
    .attr("class", "cell")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    })
    .on("click", function(d) {
      return zoom(node == d.parent ? root : d.parent);
    });

var color = d3.scaleOrdinal(d3.schemeCategory20c);
  cell.append("svg:rect")
    .attr("width", function(d) {
      return Math.abs(d.x1 - d.x0) - 1;
    })
    .attr("height", function(d) {
      return Math.abs(d.y1 - d.y0) - 1;
    })
    .style("fill", function(d) {
      return color(d.parent.value);
    });

  cell.append("svg:text")
    .attr("x", function(d) {
      return Math.abs(d.x1 - d.x0) / 2;
    })
    .attr("y", function(d) {
      return Math.abs(d.y1 - d.y0) / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.parent.data.name + "-" + d.data.name;
    })
    .style("opacity", function(d) {
      d.w = this.getComputedTextLength();
      return Math.abs(d.x1 - d.x0) > d.w ? 1 : 0;
    });

  d3.select(window).on("click", function() {
    zoom(root);
  });

  d3.select("select").on("change", function() {
    treemap.value(this.value == "size" ? size : count).nodes(root);
    zoom(node);
  });
}

function size(d) {
  return d.data.size;
}

function count(d) {
  return 1;
}


function zoom(d) {

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([0, height]);

  var kx = width / Math.abs(d.x1 - d.x0),
    ky = height / Math.abs(d.y1 - d.y0);
  x.domain([d.x0, d.x1]);
  y.domain([d.y0, d.y1]);

  var t = svg.selectAll("g.cell").transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .attr("transform", function(d) {
      return "translate(" + x(d.x0) + "," + y(d.y0) + ")";
    });

  t.select("rect")
    .attr("width", function(d) {
      return kx * Math.abs(d.x1 - d.x0) - 1;
    })
    .attr("height", function(d) {
      return ky * Math.abs(d.y1 - d.y0) - 1;
    })

  t.select("text")
    .attr("x", function(d) {
      return kx * Math.abs(d.x1 - d.x0) / 2;
    })
    .attr("y", function(d) {
      return ky * Math.abs(d.y1 - d.y0) / 2;
    })
    .style("opacity", function(d) {
      return kx * Math.abs(d.x1 - d.x0) > d.w ? 1 : 0;
    });

  node = d;
  d3.event.stopPropagation();
}