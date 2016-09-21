"use strict";

function showTree(root, width, height, margin, func) {

    var svg = d3.select("#statetree").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g = svg.append("g").attr("transform", "translate(40,0)");
    var tree = d3.tree().size([height, width - 160]);
    var root = root.sort(function(a, b) {
        return (a.height - b.height) || a.id.localeCompare(b.id);
    });
    tree(root);

    var link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function(d) {
            return "M" + d.y + "," + d.x +
                "C" + (d.y + d.parent.y) / 2 + "," + d.x +
                " " + (d.y + d.parent.y) / 2 + "," + d.parent.x +
                " " + d.parent.y + "," + d.parent.x;
        });

    var node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", function(d) {
            return "node" + (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    node.append("circle")
        .attr("class", function(d) {
            var clss = d.data.errors ? d.data.errors.map(e => e.name).join(' ') : "";
            if (d.data.simulatedNil) clss += " simulatedNil";
            return clss;
        })
        .attr("r", 5)
        .on("click", function(d) {

            var mallocs = [];
            let t = d;
            while (t) {
                mallocs = t.data.mallocs.concat(mallocs);
                t = t.parent;
            }
            func(mallocs, d.data.stack);
        });

    node.append("text")
        .attr("dy", 1.5)
        .attr("x", function(d) {
            return -2;//d.children ? -8 : 8;
        })
        //.style("text-anchor", function(d) {
        //    return d.children ? "end" : "start";
        //})
        .text(function(d) {
            return "M";// + d.data.memory;
        });

    node.append("title")
        .text(function(d) {
            var text = "Memory: " + d.data.memory + "\n";
            if (d.data.simulatedNil) text += "Simulated out of memory\n";
            if (d.data.errors && d.data.errors.length > 0) {
                text += "Errors:\n"
                d.data.errors.forEach(e => {
                    text += e.name + " in " + e.func + "() at " + e.file + "\n"
                });
            }
            return text;
        });
}