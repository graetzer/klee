function showSunflower(root, width, height, margin) {
    var radius = (Math.min(width, height) / 2) - 10;

    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear().range([0, 2 * Math.PI]);
    var y = d3.scaleSqrt().range([0, radius]);
    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var partition = d3.partition().sum(d => d.size) //.value(function(d) { return d.size; });

    var arc = d3.arc()
        .startAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
        })
        .endAngle(function(d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
        })
        .innerRadius(function(d) {
            return Math.max(0, y(d.y0));
        })
        .outerRadius(function(d) {
            return Math.max(0, y(d.y1));
        });

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) {
            return color((d.children ? d : d.parent).name);
        })
        .on("click", click)
        .append("title")
        .text(function(d) {
            return d.name + "\n" + formatNumber(d.value);
        });

}

function click(d) {
    svg.transition()
        .duration(750)
        .tween("scale", function() {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(y.domain(), [d.y, 1]),
                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function(t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
            };
        })
        .selectAll("path")
        .attrTween("d", function(d) {
            return function() {
                return arc(d);
            };
        });
}