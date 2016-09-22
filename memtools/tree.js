"use strict";

var _circles;

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
        }).on("click", function(d) {

            var mallocs = [];
            let t = d;
            while (t) {
                mallocs = t.data.mallocs.concat(mallocs);
                t = t.parent;
            }
            func(d.data, mallocs);
        });

    _circles = node.append("circle")
        .attr("class", function(d) {
            var clss = d.data.errors ? d.data.errors.map(e => e.name).join(' ') : "";
            if (d.data.simulatedNil) clss += " simulatedNil";
            return clss;
        })
        .attr("r", 5);


    node.filter(d => d.data.errors)
        .append("text")
        .attr("y", 2.75)
        .attr("x", function(d) {
            return -2.75;
        })
        .text(function(d) {
            var errs = d.data.errors;
            if (errs && errs.length > 0) {
                if (errs[errs.length - 1].name == "outofmemory") return "O";
                else if (errs[errs.length - 1].name == "nullptr") return "N";
            }
            return null;
        });

    node.filter(d => !d.children)
        .append("text")
        .attr("y", function(d) {
            return 2;
        })
        .attr("x", function(d) {
            return 8;
        })
        .attr("style", function(d) {
            return "fill:#000;font-size:10px";
        }).text(d => d.data.memory);

    node.append("title")
        .text(function(d) {
            var text = "Memory: " + d.data.memory + "\n";
            if (d.data.simulatedNil) text += "Simulated out of memory\n";
            if (d.data.errors && d.data.errors.length > 0) {
                text += "Errors:\n"
                d.data.errors.forEach(e => {
                    text += e.name + " in " + e.func + "() at " +
                        e.file + "#" + e.line + "\n";
                });
            }
            return text;
        });
}

function searchFuncs(name) {
    _circles.attr("style", function(d) {
        var stack = d.data.stack;
        if (name && stack && stack.length > 0) {
            for (var i = 0; i < stack.length; i++)
                if (stack[i].func.indexOf(name) !== -1)
                    return "fill:#0055e7";
        }
        var errs = d.data.errors;
        if (errs && errs.length > 0) {
            for (var i = 0; i < errs.length; i++)
                if (errs[i].func.indexOf(name) !== -1)
                    return "fill:#0055e7";
        }
        return null;
    });
}