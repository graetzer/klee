function showTreeMap(root, width, height) {
  var treemap = d3.treemap()
    .round(false)
    .size([width, height])
    .sticky(true)
    .value(function(d) {
      return d.size;
    });

  var svg = d3.select("#treemap")
    .attr("class", "chart")
    .style("width", width + "px")
    .style("height", height + "px")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(.5,.5)");

  var node = root;

  var nodes = treemap.nodes(root)
    .filter(function(d) {
      return !d.children;
    });

  var cell = svg.selectAll("g")
    .data(nodes)
    .enter().append("svg:g")
    .attr("class", "cell")
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })
    .on("click", function(d) {
      return zoom(node == d.parent ? root : d.parent);
    });

  cell.append("svg:rect")
    .attr("width", function(d) {
      return d.dx - 1;
    })
    .attr("height", function(d) {
      return d.dy - 1;
    })
    .style("fill", function(d) {
      return color(d.parent.name);
    });

  cell.append("svg:text")
    .attr("x", function(d) {
      return d.dx / 2;
    })
    .attr("y", function(d) {
      return d.dy / 2;
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.name;
    })
    .style("opacity", function(d) {
      d.w = this.getComputedTextLength();
      return d.dx > d.w ? 1 : 0;
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
  return d.memory;
}

function count(d) {
  return 1;
}

function zoom(d) {
  var kx = w / d.dx,
    ky = h / d.dy;
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, d.y + d.dy]);

  var t = svg.selectAll("g.cell").transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .attr("transform", function(d) {
      return "translate(" + x(d.x) + "," + y(d.y) + ")";
    });

  t.select("rect")
    .attr("width", function(d) {
      return kx * d.dx - 1;
    })
    .attr("height", function(d) {
      return ky * d.dy - 1;
    })

  t.select("text")
    .attr("x", function(d) {
      return kx * d.dx / 2;
    })
    .attr("y", function(d) {
      return ky * d.dy / 2;
    })
    .style("opacity", function(d) {
      return kx * d.dx > d.w ? 1 : 0;
    });

  node = d;
  d3.event.stopPropagation();
}