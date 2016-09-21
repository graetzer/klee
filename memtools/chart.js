"use strict";

function showChart(selector, data, width, height, margin, func) {

    var x = d3.scaleBand()
        .domain(data.map(m => m.memory))
        .rangeRound([0, width]).padding(0.05),
        y = d3.scaleLinear()
        .domain([0, d3.max(data, m => m.memory)])
        .rangeRound([height, 0]);

    var remove = document.querySelector(selector + " svg");
    if (remove) remove.parentNode.removeChild(remove);

    var svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill","#000")
        .text("Heap-RAM");

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) {
            return x(d.memory);
        })
        .attr("y", function(d) {
            return y(d.memory);
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d) {
            return height - y(d.memory);
        })
        .on("click", func);

    var axis = svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height+1) + ")")
        .call(d3.axisBottom(x));

    axis.selectAll(".tick text")
        .text((d,i) => (i+1)+"");// because fuch d3-axis
    //axis.
}