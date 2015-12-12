
// First graph
var tv = 250;

var graph = new Rickshaw.Graph( {
	element: document.getElementById("chart"),
	width: 900,
	height: 500,
	renderer: 'lineplot',
	series: 
		new Rickshaw.Series.FixedDuration([{ name: 'Speed' }, { name: 'Direction' }], undefined, {
		timeInterval: tv,
		maxDataPoints: 20
        }) 
} );

var xTicks = new Rickshaw.Graph.Axis.X({
  graph: graph,
  orientation: "bottom",
  element: document.querySelector("#x_axis")
});

var yTicks = new Rickshaw.Graph.Axis.Y({
  graph: graph,
  orientation: "left",
  element: document.querySelector("#y_axis")
});
  
var graphHover = new Rickshaw.Graph.HoverDetail({
  graph: graph
});
  
var myLegend = new Rickshaw.Graph.Legend({
  graph: graph,
  element: document.querySelector("#mylegend")
});
  
var previewSlider = new Rickshaw.Graph.RangeSlider.Preview({
    graph: graph,
    element: document.querySelector("#previewSlider")
});

graph.render();

// Second graph
var x = 1;
var seriesData = [];

var graphChill = new Rickshaw.Graph( {
	element: document.getElementById("chartChill"),
	renderer: 'multi',
	width: 900,
	height: 500,
	dotSize: 5,
    tv : 250,
	series: [
		{
			name: 'chill',
			data: seriesData,
			color: 'rgba(255, 0, 0, 0.4)',
			renderer: 'bar'
		}
	]
} );

var axes = new Rickshaw.Graph.Axis.X( { graph: graphChill } );
  
var yTicks = new Rickshaw.Graph.Axis.Y({
  graph: graphChill,
  orientation: "left",
  element: document.querySelector("#y_axis2")
});

var myLegend2 = new Rickshaw.Graph.Legend({
    graph: graphChill,
    element: document.querySelector("#mylegend2")
  });

graphChill.render();


refreshStatus(); // run once immediately 
var refreshInterval1 = window.setInterval(refreshStatus, 5000); // Refresh status every 60 seconds

function refreshStatus()
{
    xhrGet("api/jax-rs/refreshStatus", function(responseText){
	
    // Process data
    process();
    
    }, function(err){
	  console.log(err);
    });
}

function process()
{
	xhrGet("api/jax-rs/topTens", function(responseText){
    
    console.log(responseText);
    
    // Process json message
    var jsonObject = JSON.parse(responseText);
    
    // Update first graph data
    var data = { Speed: parseInt(jsonObject.speed) };
	data.Direction = parseInt(jsonObject.direction);

	graph.series.addData(data);
    
    // Update second graph data
    var update = { x : x, y : jsonObject.chill};
    x = x + 1;
    seriesData.push(update);
    
    // Render the graphs
    graph.render(); 
	graphChill.render();
    
    });
}

//utilities

function createXHR(){
	if(typeof XMLHttpRequest != 'undefined'){
		return new XMLHttpRequest();
	}else{
		try{
			return new ActiveXObject('Msxml2.XMLHTTP');
		}catch(e){
			try{
				return new ActiveXObject('Microsoft.XMLHTTP');
			}catch(e){}
		}
	}
	return null;
}
function xhrGet(url, callback, errback){
	var xhr = new createXHR();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			if(xhr.status == 200){
				callback(xhr.responseText);
			}else{
				errback('service not available');
			}
		}
	};
	xhr.timeout = 60000; // set 1 minute timeout
	xhr.ontimeout = errback;
	xhr.send();
}
function parseJson(str){
	return window.JSON ? JSON.parse(str) : eval('(' + str + ')');
}
function prettyJson(str){
	// If browser does not have JSON utilities, just print the raw string value.
	return window.JSON ? JSON.stringify(JSON.parse(str), null, '  ') : str;
}

