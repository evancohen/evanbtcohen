/**
  * Adopted From: https://github.com/jeyb/d3.punchcard
  * API Endpoint: https://developer.github.com/v3/repos/statistics/#punch-card
**/
require(['d3'], function () {
var pane_left = 55
  , pane_right = document.getElementById("punchcard").offsetWidth - pane_left
  , width = pane_left + pane_right
  , height = 520
  , margin = 10
  , i
  , j
  , tx
  , ty
  , max = 0;

$("#punchcard-form").on('submit', function(){
  var repo = $("#punchcard-repo").val();
  fetchData(repo);
  return false;
});

function dataTransform(target){
  var newData = data = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  for(var i = 0; i < target.length; i++){
    var dataPoint = target[i];
    newData[dataPoint[0]][dataPoint[1]] = dataPoint[2];
  }
  return newData;
}

function fetchData(repo){
  $.get("https://api.github.com/repos/"+repo+"/stats/punch_card")
    .done(function(result){
      var newData = dataTransform(result);
      $("#punchcard").html('');
      generatePunchcard(newData);
    })
    .error(function(err){
      alert("Sorry, that didn't work!");

    });

  var contributors = $("#contributors");
  contributors.html('<div class="text-center x-margin-top-45"><img src="/info-vis/images/ajax-loader.gif"></div>');
  populateContributors(repo, contributors);
}

function populateContributors(repo, contributors){
    $.get("https://api.github.com/repos/"+repo+"/stats/contributors")
    .done(function(result){
      if(result === undefined || result[0] == undefined){
        setTimeout(function(){
          populateContributors(repo, contributors);
        }, 5000);
      }else{
        //these are sorted by 'total' commits in increasing order
        $contributors = $("<ul/>", {class : "contrib-list list-small"});
        //$contributors.addClass("repo-list list-small");
        for(i = result.length - 1; i >= 0 && i > result.length - 6; i--){
          $person = $("<li/>", {text : ' ' + result[i].author.login})
            .prepend($("<img/>", {src: result[i].author.avatar_url + 'size=64'}));
          $person.append($("<span/>", {class:"pull-right", text:result[i].total}));
          $contributors.append($person);
        }
        contributors.html('');
        console.log($contributors);
        contributors.append($contributors);
      }
    })
    .error(function(err){
      contributors.html('<p>Could not find any contributors.</p>');
    });
}

fetchData('twbs/bootstrap');
function generatePunchcard(data){
  // X-Axis.
  var x = d3.scale.linear().domain([0, 23]).
    range([pane_left + margin, pane_right - 2 * margin]);

  // Y-Axis.
  var y = d3.scale.linear().domain([0, 6]).
    range([2 * margin, height - 10 * margin]);

  // The main SVG element.
  var punchcard = d3.
    select("#punchcard").
    append("svg").
    attr("width", width - 2 * margin).
    attr("height", height - 2 * margin).
    append("g");

  // Hour line markers by day.
  for (i in y.ticks(7)) {
    punchcard.
      append("g").
      selectAll("line").
      data([0]).
      enter().
      append("line").
      attr("x1", margin).
      attr("x2", width - 3 * margin).
      attr("y1", height - 3 * margin - y(i)).
      attr("y2", height - 3 * margin - y(i)).
      style("stroke-width", 1).
      style("stroke", "#efefef");

    punchcard.
      append("g").
      selectAll(".rule").
      data([0]).
      enter().
      append("text").
      attr("x", margin).
      attr("y", height - 3 * margin - y(i) - 5).
      attr("fill","white").
      attr("text-anchor", "left").
      style("fill", "#fff").
      text(["Saturday", "Friday", "Thursday", "Wednesday", "Tuesday", "Monday", "Sunday"][i]);

    punchcard.
      append("g").
      selectAll("line").
      data(x.ticks(24)).
      enter().
      append("line").
      attr("x1", function(d) { return pane_left - 2 * margin + x(d); }).
      attr("x2", function(d) { return pane_left - 2 * margin + x(d); }).
      attr("y1", height - 4 * margin - y(i)).
      attr("y2", height - 3 * margin - y(i)).
      style("stroke-width", 1).
      style("stroke", "#ccc");
  }

  // Hour text markers.
  punchcard.
    selectAll(".rule").
    data(x.ticks(24)).
    enter().
    append("text").
    attr("class", "rule").
    attr("x", function(d) { return pane_left - 2 * margin + x(d); }).
    attr("y", height - 3 * margin).
    attr("text-anchor", "middle").
    style("fill", "#fff").
    text(function(d) {
      if (d === 0) {
        return "12a";
      } else if (d > 0 && d < 12) {
        return d;
      } else if (d === 12) {
        return "12p";
      } else if (d > 12 && d < 25) {
        return d - 12;
      }
    });

  // Data has array where indicy 0 is Monday and 6 is Sunday, however we draw
  // from the bottom up.
  data = data.reverse();

  // Find the max value to normalize the size of the circles.
  max = 0;
  for (i = 0; i < data.length; i++) {
    max = Math.max(max, Math.max.apply(null, data[i]));
  }

  // Show the circles on the punchcard.
  for (i = 0; i < data.length; i++) {
    for (j = 0; j < data[i].length; j++) {
      punchcard.
        append("g").
        selectAll("circle").
        data([data[i][j]]).
        enter().
        append("circle").
        style("fill", "#9eb680"). /*Green*/
        on("mouseover", mover).
        on("mouseout", mout).
        on("mousemove", function() {
         return tooltip.
           style("top", (d3.event.pageY - 10) + "px").
           style("left", (d3.event.pageX + 10) + "px");
        }).
        attr("r", function(d) { return d / max * 14; }).
        attr("transform", function() {
            tx = pane_left - 2 * margin + x(j);
            ty = height - 7 * margin - y(i);
            return "translate(" + tx + ", " + ty + ")";
          });
    }
  }
}

function mover(d) {
  tooltip = d3.select("body")
   .append("div")
   .style("position", "absolute")
   .style("z-index", "99999")
   .style("color", "#fff")
   .attr("class", "vis-tool-tip")
   .text(d);
}

function mout(d) {
  $(".vis-tool-tip").fadeOut(50).remove();
}

return true;

});