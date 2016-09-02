
function showRadialTree(root, width, height, margin) {

    var svg = d3.select("#hierarchy").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + (height / 2 + 20) + ")");
    var cluster = d3.cluster().size([360, width / 2 - 120]);

    root.sort(function(a, b) {
        return a.height - b.height || a.id.localeCompare(b.id);
    });

    cluster(root);

    var link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            return "M" + project(d.x, d.y) +
                "C" + project(d.x, (d.y + d.parent.y) / 2) +
                " " + project(d.parent.x, (d.y + d.parent.y) / 2) +
                " " + project(d.parent.x, d.parent.y);
        });

    var node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", function(d) {
            return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function(d) {
            return "translate(" + project(d.x, d.y) + ")";
        });

    node.append("circle")
        .attr("r", 2.5);

    node.append("text")
        .attr("dy", "0.31em")
        .attr("x", function(d) {
            return d.x < 180 === !d.children ? 6 : -6;
        })
        .style("text-anchor", function(d) {
            return d.x < 180 === !d.children ? "start" : "end";
        })
        .attr("transform", function(d) {
            return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
        })
        .text(function(d) {
            var str = "M:" + d.data.memory;
            if (d.data.errors && d.data.errors.length > 0) str += d.data.errors[0];
            return str;
        });
}

function project(x, y) {
    var angle = (x - 90) / 180 * Math.PI,
        radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}