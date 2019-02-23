/**
 * Created by Sandy on 6/4/2014.
 */
//Define module
var myApp = angular.module('myApp', []);

//Set up controller
myApp.controller('MainCtrl', function($scope, $interval){

    //Capture query string from landing page link
    var queryString = window.location.href.split('?')[1];
    if(queryString){var query = parseInt(queryString.replace(/\D/g,''));}


    //Define master city list with query values

    $scope.cityList = [
        {name:"Atlanta-Sandy Springs-Marietta, GA", value: "atlanta", index: 0},
        {name:"Baltimore-Towson, MD", value: "baltimore",index: 1},
        {name:"Chicago-Naperville-Joliet, IL", value: "chicago",index: 2},
        {name:"Dallas-Plano-Irving, TX", value: "dallas",index: 3},
        {name:"Denver-Aurora, CO", value: "denver",index: 4},
        {name:"Edison, NJ", value: "edison",index: 5},
        {name:"Houston-Baytown-Sugar Land, TX", value: "houston",index: 6},
        {name:"Los Angeles-Long Beach-Glendale, CA", value: "losangeles",index: 7},
        {name:"Miami-Miami Beach-Kendall, FL", value: "miami",index: 8},
        {name:"Minneapolis-St. Paul-Bloomington, MN-WI", value: "minneapolis",index: 9},
        {name:"Nassau-Suffolk, NY", value: "nassau",index: 10},
        {name:"New York-Wayne-White Plains, NY-NJ", value: "newyork",index: 11},
        {name:"Oakland-Fremont-Hayward, CA", value: "oakland",index: 12},
        {name:"Philadelphia, PA", value: "philadelphia",index: 13},
        {name:"Phoenix-Mesa-Scottsdale, AZ", value: "phoenix",index: 14},
        {name:"Pittsburgh, PA", value: "pittsburgh",index: 15},
        {name:"Portland-Vancouver-Beaverton, OR-WA", value: "portland",index: 16},
        {name:"Riverside-San Bernardino-Ontario, CA", value: "riverside",index: 17},
        {name:"San Diego-Carlsbad-San Marcos, CA", value: "sandiego",index: 18},
        {name:"San Francisco-San Mateo-Redwood City, CA", value: "sanfrancisco",index: 19},
        {name:"Santa Ana-Anaheim-Irvine, CA", value: "santaana",index: 20},
        {name:"Seattle-Bellevue-Everett, WA", value: "seattle",index: 21},
        {name:"St. Louis, MO-IL", value: "stlouis",index: 22},
        {name:"Tampa-St. Petersburg-Clearwater, FL", value: "tampa",index: 23}
    ];

    //Select either city from query or the first city on the list by default
    $scope.myCity = query ? $scope.cityList[query] : $scope.cityList[0];

    //City name
    $scope.cityName = $scope.myCity.name;

    //Define file names from selected city to feed to queue
    var metro_selected = $scope.myCity.value;
    var tract_file = "data/js/"+metro_selected+".js";
    var bar_file = "data/csv/"+metro_selected+".csv";
    var city_file = "data/js/"+metro_selected+"_city.js";

    //Use queue to read in data (attributes and geo all in one topojson)
    queue()
        .defer(d3.json, tract_file) //city map file
        .defer(d3.csv, bar_file) //city bar chart file
        .defer(d3.json, city_file) //city yellow boundary file
        .defer(d3.json, "data/js/unitedstates.js") //us shapefile
        .defer(d3.csv, "data/csv/national.csv") //national bar chart data
        .defer(d3.csv, "data/csv/centroids.csv") //city locations and links
        .await(ready);

    //Read in data and assign scope
    function ready(error, city, bars, boundary, us, stack, centroids){

        if(error) throw error;
        $scope.$apply(function(){
            $scope.counties = topojson.feature(city, city.objects.counties);
            $scope.bars = bars;
            $scope.boundaries = topojson.feature(boundary, boundary.objects.boundaries);
            $scope.national = topojson.feature(us, us.objects.states);
            $scope.nationalbars = stack;
            $scope.centroids = centroids;

            //Time Lapse function
            //Initialize starting value to 1970

            $scope.year = 1970;
            $scope.shortYear = "70";
        });
    }

    var stop;

    $scope.startMap = function() {
        // Don't start if time lapse is running
        if ( angular.isDefined(stop) ) return;

        //Increment year variable by 10 (correct by 1 if 2010)
        stop = $interval(function() {

            if ($scope.year>=1970 && $scope.year<2007) {
                $scope.year = $scope.year+10;
                $scope.shortYear = $scope.year.toString().substr(2,2);

                if($scope.shortYear=="10"){
                    $scope.shortYear="09";
                    $scope.year = 2007;
                }

                //Pass median income category variable to map color function
                colorMap($scope.shortYear);

            } else {
                $scope.stopMap();
            }
        }, 1000); //lasts 1000 ms
    };

    //Stop interval function
    $scope.stopMap = function() {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    };

    //Reset interval to starting values
    $scope.resetMap = function() {
        $scope.year = 1970;
        $scope.shortYear = "70";

        //Pass median income category variable to map color function
        colorMap($scope.shortYear);
    };

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $scope.stopMap();
    });

    $scope.switchYear = function(year){
        //Grab year from button input
        $scope.year = year;
        $scope.shortYear = $scope.year.toString().substr(2,2);

        //Switch to 2007 internal value
        if($scope.shortYear=="09"){
            $scope.year = 2007;
        }

        //Pass median income category variable to map color function
        colorMap($scope.shortYear);

    };

    $scope.switchCity = function(){
        //City name
        var metro_selected = $scope.myCity.value;

        //Define file names from selected city to feed to queue
        var tract_file = "data/js/"+metro_selected+".js";
        var bar_file = "data/csv/"+metro_selected+".csv";
        var city_file = "data/js/"+metro_selected+"_city.js";

        queue()
            .defer(d3.json, tract_file)
            .defer(d3.csv, bar_file)
            .defer(d3.json, city_file)
            .await(ready);

        function ready(error, city, bars, boundary){

            if(error) throw error;
            $scope.$apply(function() {
                $scope.counties = topojson.feature(city, city.objects.counties);
                $scope.bars = bars;
                $scope.boundaries = topojson.feature(boundary, boundary.objects.boundaries);
                $scope.cityName = $scope.myCity.name;
                $scope.year = 1970;
                $scope.shortYear = "70";
            });
        }
    };

    $scope.cityLink = function(){
        //Function to navigate to city pages from landing page using dropdown menu
        var metro_index = $scope.myCity.index;
        var url ="metros.html?page="+ metro_index;
        window.open(url, "_self");
    };

    $scope.zoomIn = function(){
        //Function to zoom in on button click
        plusZoom();
    };

    $scope.zoomOut = function(){
        //Function to zoom out on button click
        minusZoom();
    };

});

//This directive is for the map on the city page
myApp.directive('cityMap', function(){
    function link(scope, element, attr){

        //Define dimensions of svg
        var el = element[0];
        var width=600,
            height=480,
            active = d3.select(null); //for zoom function

        //Map title
        var title = d3.select(el).append("div");

        //Width and height percentages for scalable svg
        var width_ratio = "80%";
        var height_ratio =  "80%";

        //Define scalable svg
        var svg = d3.select(el).append('svg')
            .attr("width", width_ratio)
            .attr("height", height_ratio)
            .attr("viewBox", "0, 0," + width + "," + height )
            .attr("preserveAspectRatio", "xMidYMid");

        //Color scale for map
        var color = d3.scale.ordinal().domain([1,2,3,4,5,6])
            .range(colorbrewer.PRGn[6]);

        //Initial scale and offset for map projection
        var scale  = 250;
        var offset = [width/2, height/2];

        //Set up map projection, svg, and rectangle for map background
        var projection = d3.geo.albersUsa()
            .scale(scale)
            .translate(offset);

        var path = d3.geo.path()
            .projection(projection);

        var g = svg.append('g').attr("id", "this-map");

        //Background rectangle for map
        var rect = g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "background-rect");

        //Currency formatter
        var formatCurrency = d3.format("$,.2f");

        //Watch function for when map data has loaded
        scope.$watch("counties", function (geo) {
            if(!geo) return;

            //Convert strings to numbers for median income
            geo.features.forEach(function(d){
                d.properties.medfinc70 = parseFloat(d.properties.medfinc70);
                d.properties.medfinc80 = parseFloat(d.properties.medfinc80);
                d.properties.medfinc90 = parseFloat(d.properties.medfinc90);
                d.properties.medfinc00 = parseFloat(d.properties.medfinc00);
                d.properties.medfinc09 = parseFloat(d.properties.medfinc09);

            });

            //Master bounds of map (100% zoom) - global variable
            var bounds = path.bounds(geo),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                master_scale = .9 / Math.max(dx / width, dy / height),
                master_translate = [width / 2 - master_scale * x, height / 2 - master_scale * y];

            //Translate map according to 100% zoom - global variable
            var map = g.attr("transform", "translate(" + master_translate + ")scale(" + master_scale + ")");

            //Remove current states
            d3.selectAll(".states").remove();

            //Select states for data binding
            var states = map.selectAll(".states");

            //Populate path with state geo data
            var new_states = states.data(geo.features);

            new_states
                .enter()
                .append("path")
                .attr("class","states")
                .attr("id", function(d, i){return i});

            new_states.exit().remove();

            //Zoom in function
            plusZoom = function(){
                //Get current map settings
               var this_transform = document.getElementById("this-map").getAttribute('transform');
               var current_transform = this_transform.split(/[',',')','(',\s]+/);

               var current_translate_x = parseFloat(current_transform[1]);
               var current_translate_y =  parseFloat(current_transform[2]);
               var current_scale = parseFloat(current_transform[4]);

               //Reverse engineer x and y offsets
               var x_offset = (current_translate_x-width/2)/-current_scale;
               var y_offset = (current_translate_y-height/2)/-current_scale;

              //Set new scale
               var new_scale = current_scale+current_scale/2;
              //Set max scale
               if(new_scale>master_scale*10) return;

               //Set new translate
               var new_translate = [width / 2 - new_scale * x_offset, height / 2 - new_scale * y_offset];

                //Transition to new zoom
                g.transition()
                    .duration(750)
                    .attr("transform", "translate(" + new_translate + ")scale(" + new_scale + ")");

            };

            //Zoom out function
            minusZoom = function(){
                //Get current map settings
                var this_transform =document.getElementById("this-map").getAttribute('transform');
                var current_transform = this_transform.split(/[',',')','(',\s]+/);

                var current_translate_x = parseFloat(current_transform[1]);
                var current_translate_y =  parseFloat(current_transform[2]);
                var current_scale = parseFloat(current_transform[4]);

                //Reverse engineer x and y offsets
                var x_offset = (current_translate_x-width/2)/-current_scale;
                var y_offset = (current_translate_y-height/2)/-current_scale;

                //Set new scale
                var new_scale = current_scale-current_scale/2;
                //Set max scale
                if(new_scale<master_scale/2) return;

                //Set new translate
                var new_translate = [width / 2 - new_scale * x_offset, height / 2 - new_scale * y_offset];

                //Transition to new zoom
                g.transition()
                    .duration(750)
                    .attr("transform", "translate(" + new_translate + ")scale(" + new_scale + ")");
            };

            //Click to zoom function that zooms to bounds of selected tract
           function clicked(d) {
               //Stop function if tract has no data
               var fill = window.getComputedStyle(this).fill;
               if(fill=="rgb(255, 255, 255)")return;

               //Define relevant variables
               var medcat = 'medcat'+scope.shortYear;
               var medfinc = 'medfinc'+scope.shortYear;

                //Set clicked tract as active
                active.classed("active", false);
                active = d3.select(this).classed("active", true);

               //Get current map settings
               var this_transform = document.getElementById("this-map").getAttribute('transform');
               var current_transform = this_transform.split(/[',',')','(',\s]+/);

               var current_scale = parseFloat(current_transform[4]);

                var bounds = path.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = current_scale,
                    translate = [width / 2 - scale * x, height / 2 - scale * y];

               //Switch to zoomed-in translation
                g.transition()
                    .duration(750)
                    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
            }

          //Mouseover function to show tract info
          function hoverOn(d){
                //Define relevant variables
                var medcat = 'medcat'+scope.shortYear;
                var medfinc = 'medfinc'+scope.shortYear;

                //Put greater than 200,000 on tracts at ceiling median income (adjusted for inflation using http://data.bls.gov/cgi-bin/cpicalc.pl)
                var inc70 = 5.34*d.properties.medfinc70 >= 200000 ? "> $200,000.00" : formatCurrency(5.34*d.properties.medfinc70);
                var inc80 = 2.52*d.properties.medfinc80 >= 200000 ? "> $200,000.00" : formatCurrency(2.52*d.properties.medfinc80);
                var inc90 = 1.59*d.properties.medfinc90 >= 200000 ? "> $200,000.00" : formatCurrency(1.59*d.properties.medfinc90);
                var inc00 = 1.20*d.properties.medfinc00 >= 200000 ? "> $200,000.00" : formatCurrency(1.20*d.properties.medfinc00);
                var inc09 = d.properties.medfinc09 >= 200000 ? "> $200,000.00" : formatCurrency(d.properties.medfinc09);

                //If missing, replace with ---
                var inc70NA = (inc70=="$NaN" | inc70=="$0.00") ? "Unavailable" : inc70;
                var inc80NA = (inc80=="$NaN" | inc80=="$0.00") ? "Unavailable" : inc80;
                var inc90NA = (inc90=="$NaN" | inc90=="$0.00") ? "Unavailable" : inc90;
                var inc00NA = (inc00=="$NaN" | inc00=="$0.00") ? "Unavailable" : inc00;
                var inc09NA = (inc09=="$NaN" | inc09=="$0.00") ? "Unavailable" : inc09;

              if(d.properties[medcat]!=0 && d.properties[medfinc]>0){ //if tract has data
                    //Darken stroke
                    d3.select(this).classed('selected', true);

                  //Offsets for info window
                  var left_offset=30,
                        bottom_offset=30;

                  //Populate variables in info window
                    d3.select(".info-window")
                        .style("opacity", 1)
                        .style("left", (d3.event.pageX+left_offset) + "px")
                        .style("top", (d3.event.pageY-bottom_offset) + "px")
                        .html(
                                "<table class='info-table'>" +
                                "<br><tr><td colspan='2'><b>Median Income over Time (in 2007 dollars)</b></td>" +
                                "<tr><td colspan='2'>(Tract ID, 2000 Census: "+ d.properties.GEO2000+")</td></tr>"+
                                "<tr><td style='width:50%'>1970</td><td>" +  inc70NA + "</td></tr>"+
                                "<tr><td>1980</td><td>" + inc80NA + "</td></tr>"+
                                "<tr><td>1990</td><td>" + inc90NA + "</td></tr>"+
                                "<tr><td>2000</td><td>" + inc00NA + "</td></tr>"+
                                "<tr><td>2007</td><td>" + inc09NA + "</td></tr>"
                    );
                }

          }

          function hoverOut(d){
              //Undo all hoverOn changes
              d3.select(this).classed("selected", false);
              d3.select(".info-window")
                  .style("opacity", 0);
          }

            //Define color map function
            colorMap = function colorMap(year){

                //Convert year value to year for title
                if(year=="00"){var title_year="2000"}
                else if(year=="09"){var title_year="2007"}
                else {var title_year="19"+year}

                //Map title
                title.html("<b>Neighborhood Income Composition</b><br/>"+scope.cityName+", "+title_year+"<br/>&nbsp;");

                var medfinc = 'medfinc'+ year;
                var medcat = 'medcat' + year;

                //Color paths according to median income ratios for year selected
                d3.selectAll(".states")
                    .attr("d", path)
                    .attr("fill", function(d){
                        var value = (d.properties[medcat] && d.properties[medfinc]>0 )? d.properties[medcat] : null;
                        if(value){return color(value);}
                        else{return '#F9F9F6'}

                    })
                    .attr("stroke", function(d){
                        var value = (d.properties[medcat] && d.properties[medfinc]>0 )? d.properties[medcat] : null;
                        if(value){return 'black';}
                        else{return 'none'}
                    })
                    .attr("stroke-width", function(d){
                        var value = (d.properties[medcat] && d.properties[medfinc]>0 )? d.properties[medcat] : null;
                        if(value){return '0.001';}
                        else{return 'none'}
                    });
            };

            //Color map with median income category for 1970 (default)
            colorMap('70');

            //Call mouse functions
            d3.selectAll(".states")
                .on("click", clicked)
                .on("mouseover", hoverOn)
                .on("mouseout", hoverOut);

        });

        //Watch function for city boundary file
        scope.$watch("boundaries", function (geo) {
            if (!geo) return;

            //Master bounds of map (100% zoom) - global variable
            var bounds = path.bounds(geo),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2;

            //Set scale for city boundary (make exception for Nassau because urban boundary is very small)
            var master_scale = scope.cityName=="Nassau-Suffolk, NY" ? 400 : .9 / Math.max(dx / width, dy / height);
            var master_translate = [width / 2 - master_scale * x, height / 2 - master_scale * y];

            //Translate map according to 100% zoom - global variable
            var map = g.attr("transform", "translate(" + master_translate + ")scale(" + master_scale + ")");

            //Remove current city
            d3.selectAll(".city").remove();
            //Select city elements for update
            var city = map.selectAll(".city");

            //Populate path with state geo data
            var new_city = city.data(geo.features);

            new_city
                .enter()
                .append("path")
                .attr("class","city");

            new_city.exit().remove();

            //Fill
            d3.selectAll(".city")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", "#FFFF83")
                .attr("stroke-width", "0.01")



        });

    }
    return {
        link: link,
        restrict: 'C',
        scope: {shortYear: '=', counties: '=', cityName: '=', year:'=', boundaries: '='}
    }

});

//This is the directive for the bar graph on the city page and landing page (uses same code)
myApp.directive('cityGraph', function(){
    function link(scope, element, attr){

        //Define parameters for element and svg
        var el = element[0];
        var padding_top = 20,
            padding_bottom=30,
            padding_right = 50,
            width=480,
            height=400;

        //Title of graph
        var title = d3.select(el).append("div");

        //percent format
        percentFormat = d3.format("%")

        //Scale for x axis (year)
        var xScale = d3.scale.ordinal()
            .rangeRoundBands([padding_right, width], .1);
        //Scale for y-axis (percentage of families)
        var yScale = d3.scale.linear()
            .rangeRound([height-padding_bottom, padding_top]).domain([0,1]);
        //Color scale for bars
        var color = d3.scale.ordinal()
            .range(colorbrewer.PRGn[6]);

        //Define x and y axes
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left").ticks(5).tickFormat(function(d){
               return percentFormat(d);
            });

        //Width ratio for svg
        var width_ratio = "80%";
        var height_ratio =  "80%";

        //Define scalable svg
        var barGraph = d3.select(el).append("svg")
            .attr("class", "svg-graph")
            .attr("width", width_ratio)
            .attr("height", height_ratio)
            .attr("viewBox", "0, 0," + width + "," + height )
            .attr("preserveAspectRatio", "xMidYMid");

        //Call x and y axes
        barGraph.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (height - padding_bottom) + ")")
            .call(xAxis);

        barGraph.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + padding_right + ",0)")
            .call(yAxis);

        //Draw x and y axis labels
        barGraph
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "end")
            .attr("x", width-width/2.5)
            .attr("y", height)
            .text("Year");

        barGraph
            .append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x",-width/3)
            .attr("y", 0)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percentage of Families");

        //Income category lookup for info window
        var categoryLookup = [
            {number: 0, label: "Poor"},
            {number: 1, label: "Low Income"},
            {number: 2, label: "Low-Middle Income"},
            {number: 3, label: "High-Middle Income"},
            {number: 4, label: "High Income"},
            {number: 5, label: "Affluent"}
        ];

        //Function for sizing the info window according to the svg window
        var svgDim = d3.selectAll(".svg-graph").node().getBBox();
        var svgWidth = svgDim.width;

        //Info window dimensions
        d3.select("body")
            .append("div")
            .attr("class", "info-window")
            .style("opacity", 0)
            .style("left", "0px")
            .style("top", "0px")
            .style("width", svgWidth/1.872 +"px")
            .style("height", svgWidth/3.5 + "px")
            .style("padding", svgWidth/93.6 + "px")
            .style("font-size", svgWidth/46.8 + "px");

        //Make small adjustments to info window if window resizes
        window.onresize = function() {
            //Current svg dimensions
            var svgDim = d3.selectAll(".svg-graph").node().getBBox();
            var svgWidth = svgDim.width;

            d3.selectAll(".info-window")
                .style("width", svgWidth/1.872 +"px")
                .style("height", svgWidth/3.5 + "px")
                .style("padding", svgWidth/93.6 + "px")
                .style("font-size", svgWidth/46.8 + "px");
        };

        //Function to build bar graph
        buildGraph = function (data) {
            if(!data) return;

            //Set color scale domain
            color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

            //Map year to values
            data.forEach(function(d) {
                y0=0;
                d.pcts = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            });

            //Set x scale domain and call x axis with years available in the data
            xScale.domain(data.map(function(d){return d.year}));

            barGraph.select(".x-axis").call(xAxis);

            //Draw bar graph
            var graph = barGraph.selectAll(".bars")
                .data(data)
                .enter().append("g")
                .attr("class", "g")
                .attr("transform", function(d) { return "translate(" + xScale(d.year) + ",0)"; });

            var bar_categories = graph.selectAll("rect")
                .data(function(d) { return d.pcts; })
                .enter().append("rect")
                .attr("width", xScale.rangeBand())
                .attr("y", function(d) { return yScale(d.y1); })
                .attr("height", function(d) { return yScale(d.y0) - yScale(d.y1); })
                .style("fill", function(d) { return color(d.name); })
                .attr("id", function(d){ return d.name})

            //Title based on whether it is national or city data
            var title_text = el.id =="national" ? "Metropolitan Areas with Population > 500,000, 1970-2007" : scope.cityName + " 1970-2007";
            title.html("<b>Percentage of Families Living in High-, Middle-, and Low-Income Neighborhoods</b><br/>"+title_text);

            //Percent formatter
            var formatPercent = d3.format("%");

            //Info window function
            function showInfo(d){
                var category = d.name;

                //Darken stroke
                d3.selectAll("#"+category).attr("stroke-width", "2px").attr("stroke", "black");

                //Format information
                var pct70 = formatPercent(data[0][category]);
                var pct80 = formatPercent(data[1][category]);
                var pct90 = formatPercent(data[2][category]);
                var pct00 = formatPercent(data[3][category]);
                var pct07 = formatPercent(data[4][category]);
                var category_number = category.slice(-1)-1;
                var category_label = categoryLookup[category_number].label;

                //Offsets for info window
                var left_offset=30,
                    bottom_offset=30;

                //Populate variables in info window
                d3.select(".info-window")
                    .style("opacity", 1)
                    .style("left", (d3.event.pageX+left_offset) + "px")
                    .style("top", (d3.event.pageY-bottom_offset) + "px")
                    .html(

                        "<table class='info-table'> " +
                        "<br><tr><td colspan='2'><b>Percent Living in "+category_label+"<br> Neighborhoods </b></td></tr>" +
                        "<tr><td style='width:50%'>1970</td><td>" +  pct70 + "</td></tr>"+
                        "<tr><td>1980</td><td>" + pct80 + "</td></tr>"+
                        "<tr><td>1990</td><td>" + pct90 + "</td></tr>"+
                        "<tr><td>2000</td><td>" + pct00 + "</td></tr>"+
                        "<tr><td>2007</td><td>" + pct07 + "</td></tr>"
                );

                d3.select(".info-table").style("width", svgWidth/1.872 +"px")
            }

            function hideInfo(d){
                //Undo all hoverOn changes
                var category = d.name;
                d3.selectAll("#"+category).attr("stroke-width", "0px");

                d3.select(".info-window")
                    .style("opacity", 0);
            }

            bar_categories
                .on("mouseover", showInfo)
                .on("mouseout", hideInfo);

        };

        //Watch function for when map data has loaded, using different data for city and landing page
        scope.$watch("bars", buildGraph);
        scope.$watch("nationalbars", buildGraph);

    }

    return {
        link: link,
        restrict: 'C',
        scope: {shortYear: '=', bars: '=', cityName: '=', year:'=', nationalbars:'='}
    }

});

//Directive for legend on both city and landing pages
myApp.directive('legendMap', function(){
    function link(scope, element, attr){

        //Element and svg dimensions
        var el = element[0];
        var width = 600;
        var height= 50;

        //Legend title
        var title = d3.select(el)
            .html("<span class='legend-title'>Neighborhood Median Income Level</span><br/>&nbsp;");

        //Scalable svg percentages
        var width_ratio = "80%";
        var height_ratio = "80%";

        //Define scalable svg
        var legend = d3.select(el)
            .append("svg")
            .attr("width", width_ratio)
            .attr("height", height_ratio)
            .attr("viewBox", "0, 0," + width + "," + height )
            .attr("preserveAspectRatio", "xMidYMid");

        //Data for legend
        var legend_data = [
            {line_1:"Affluent", line_2: "(150% of Metro Median)", value:  "#1b7837"},
            {line_1:"High Income", line_2: "(125-150% of Metro Median)", value:  "#7fbf7b"},
            {line_1:"High-Middle Income", line_2: "(100-125% of Metro Median)", value:  "#d9f0d3"},
            {line_1:"Low-Middle Income", line_2: "(80-100% of Metro Median)", value:  "#e7d4e8"},
            {line_1:"Low Income", line_2: "(67-80% of Metro Median)", value:  "#af8dc3"},
            {line_1:"Poor", line_2:"(<67% of Metro Median)", value:  "#762a83"}
        ];

        //Draw legend rectangles
       legend
            .selectAll("rect")
            .data(legend_data)
            .enter()
            .append("rect")
            .attr("width", "16%")
            .attr("height", "20%")
            .attr("x", function(d,i){
                return width - .16*(i+1)*width;
            })
            .attr("fill", function(d){
                return d.value;
            });

        //Add legend text
        var text = legend
            .selectAll("text")
            .data(legend_data)
            .enter()
            .append("text");

        //Line 1 of text
        text.append('tspan')
            .attr("x", function(d,i){
                return width - .16*(i+1)*width;
            })
            .attr("y", 18)
            .attr("text-anchor", "start")
            .attr("class", "legend-header")
            .text(function(d){
                return d.line_1;
            });
        //Line 2 of text
        text.append('tspan')
            .attr("x", function(d,i){
                return width - .16*(i+1)*width;
            })
            .attr("y", 26)
            .attr("class", "legend-subtitle")
            .text(function(d){
                return d.line_2;
            });


    }
    return {
        link: link,
        restrict: 'C'
    }
});

//Directive for the navigation map of US on landing page
myApp.directive('navMap', function(){
    function link(scope, element, attr){
        //Define dimensions of svg
        var el = element[0];
        var width=600,
            height=400;

        //Define scalable svg
        var svg = d3.select(el).append('svg')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", "0, 0," + width + "," + height )
            .attr("preserveAspectRatio", "xMidYMid");


        //Initial scale and offset for map projection
        var scale  = 800;
        var offset = [width/2, height/2];

        //Set up map projection, svg, and rectangle for map background
        var projection = d3.geo.albersUsa()
            .scale(scale)
            .translate(offset);

        var path = d3.geo.path()
            .projection(projection);

        var g = svg.append('g');

        //Watch function for when map data has loaded
        scope.$watch("national", function(geo){
            if (!geo) return;

            //Select element for data update
            var national = g.selectAll(".national");

            //Populate path with state geo data
            var new_national = national.data(geo.features);

            new_national
                .enter()
                .append("path")
                .attr("class","national");

            d3.selectAll(".national")
                .attr("d", path)
                .attr("fill", "#FFFFFF")
                .attr("stroke", "#AFAF93")
                .attr("stroke-width", "1");

            new_national.exit().remove();
        });

        //Watch function for the centroid data (points on map)
        scope.$watch("centroids", function(points){
            if (!points) return;

            //Convert lat long to float
            points.forEach(function(d) {
                d.Latitude = parseFloat(d.Latitude);
                d.Longitude = parseFloat(d.Longitude);
            });

            //Bind circles to lat long data
            var cityCircles = g.selectAll("circle")
                .data(points)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return projection([d.Longitude, d.Latitude])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.Longitude, d.Latitude])[1];
                })
                .attr("r", 5)
                .style("fill", "#0066FF")
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .style("opacity", 0.75);

            function showCity(d){
                //Highlight city point when selected
                d3.select(this)
                    .attr("r",6);

                //Reveal city tooltip
                d3.select(".info-window")
                    .style("opacity", 1)
                    .style("height", "30px")
                    .style("left", (d3.event.pageX+30) + "px")
                    .style("top", (d3.event.pageY-30) + "px")
                    .html("<b>" + d.LongName + "</b>");

            }

            function hideCity(d){
                //Function for sizing the info window according to the svg window
                var svgDim = d3.selectAll(".svg-graph").node().getBBox();
                var svgWidth = svgDim.width;

                //Highlight city point when selected
                d3.select(this)
                    .attr("r",5);

                d3.select(".info-window")
                    .style("opacity", 0)
                    .style("height", svgWidth/3.5 + "px") //back to normal height
                    .style("left", "0px")
                    .style("top", "0px");

            }

            //Function to link to city page on click using query string
            function goCity(d){
                var url ="metros.html?page="+ d.Query;
                window.open(url, "_self");

            }

            cityCircles
                .on("mouseover", showCity)
                .on("mouseout", hideCity)
                .on("click", goCity);

        });


    }
    return {
        link: link,
        restrict: 'C',
        scope: {national: '=', centroids: '='}
    }
});


