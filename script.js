var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("#body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* === DATA STRUCTURE === */
root = {
  name: "OSINT",
  children: [
    {
      name: "People",
      children: [
        {
          name: "Social Media",
          children: [
            { name: "Facebook" },
            { name: "Instagram" },
            { name: "Twitter" }
          ]
        },
        { name: "Public Records" }
      ]
    },
    {
      name: "Domains / IP",
      children: [
        { name: "WHOIS" },
        { name: "DNS Records" }
      ]
    }
  ]
};

root.x0 = height / 2;
root.y0 = 0;

collapse(root);
update(root);

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

function update(source) {
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  nodes.forEach(function(d) { d.y = d.depth * 180; });

  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function() {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6);

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.name; });

  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

  nodeUpdate.select("circle")
      .attr("r", 6);

  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function() {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function() {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  link.exit().transition()
      .duration(duration)
      .attr("d", function() {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}
