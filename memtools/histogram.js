var formatCount = d3.format(",.0f");

function showHistogram(data, width, height, margin) {

  var x = d3.scaleLinear()
  .domain([d3.min(data), d3.max(data)])
  .rangeRound([0, width]);
  //.padding(0.1);

  var bins = d3.histogram()
    .domain(x.domain())
    //.thresholds(x.ticks(20))
    (data);

  var y = d3.scaleLinear()
    .domain([0, d3.max(bins, function(d) {
      return d.length;
    })])
    .range([height, 0]);

  var svg = d3.select("#histogram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var bar = svg.selectAll(".bar")
    .data(bins)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) {
      return "translate(" + x(d.x0) + "," + y(d.length) + ")";
    });

  bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
    .attr("height", function(d) {
      return height - y(d.length);
    });

  bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) {
      return formatCount(d.length);
    });

  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");
}