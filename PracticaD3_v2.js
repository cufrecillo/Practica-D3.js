d3.json('https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/2482274db871e60195b7196c602700226bdd3a44/practica.json')
.then((featureCollection) => {
    drawMap(featureCollection);
})

function drawMap(featureCollection) {
    const svgMap = d3.select('#map')
    .append('svg')

    const width = 1000;
    const height = 1000;
    const border = 50
    
    svgMap.attr('width', width)
    svgMap.attr('height', height);

    const centerMap = d3.geoCentroid(featureCollection);
    const projection =  d3.geoMercator()
      .fitSize([width, height], featureCollection)
      .center(centerMap)
      .translate([width/2 + border, height/2])

    const pathProjection = d3.geoPath().projection(projection);
    const lines = featureCollection.features;

    const groupMap = svgMap
        .append('g')
        .attr('class', 'map');

    const subunitsPath = groupMap.selectAll('.sublines')
        .data(lines)
        .enter()
        .append('path');
    
    subunitsPath.attr('d', d => pathProjection(d));

    const maxAvgPrice = d3.max(lines,  (d) => d.properties.avgprice);
    const minAvgPrice = d3.min(lines,  (d) => d.properties.avgprice);
    
    const colorScale = d3.scaleSequential().domain([minAvgPrice,maxAvgPrice])
        .interpolator(d3.interpolatePlasma);

    subunitsPath.attr('fill', (d) => colorScale(d.properties.avgprice))
      
    const svgLegend = d3.select("svg");
      
    svgLegend.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(20,20)");
      
    const legendSequential = d3.legendColor()
          .shapeWidth(50)
          .cells(10)
          .orient("horizontal")
          .scale(colorScale) 
      
    svgLegend.select(".legendSequential")
        .call(legendSequential);
     
    const sample = subunitsPath.on('click', (d) => {
        const numBedrooms = [];
        const numTotalBedrooms = [];
        let numBeds = 0;
        const lengthArray = d.properties.avgbedrooms.length;

        console.log("Barrio:", d.properties.name);
        console.log("Precio medio:", d.properties.avgprice);
        console.log("Num propiedades:", d.properties.properties.length);

        for (index = 0; index < lengthArray; index++) {
            numBedrooms.push(index)
            numTotalBedrooms.push(d.properties.avgbedrooms[index].total)
            numBeds = numBeds + d.properties.avgbedrooms[index].total;
            console.log("Beds", [index], ":", d.properties.avgbedrooms[index].total);
        }
        console.log("Num total beds:", numBeds);
        console.log(numBedrooms);
        console.log(numTotalBedrooms);
        console.log(d.properties);
        
        const svgGrafic = d3.select('#map')
            .append('svg');
        
        svgGrafic
            .attr('width', width)
            .attr('height', height);
    
        const border = 100;
        const scaleX= d3.scaleBand()
            .domain(numBedrooms)
            .range([0+border, width - border]);
        
        const scaleY = d3.scaleLinear()
            .domain([0, d3.max(numTotalBedrooms)])
            .range([height - border, 0 + border]);
        
        const group = svgGrafic.append('g');
        const axisY = d3.axisLeft(scaleY).ticks(10);

        group.append('g')
            .attr('transform', `translate(${border}, 0)`)
            .call(axisY);

        const axisX = d3.axisBottom(scaleX).ticks(5);

        group.append('g')
            .attr('transform', `translate(0, ${height - border})`)
            .call(axisX);

        const stepsX = ((width - 2*border) / lengthArray)
        const widhtGrafic = 60;
        const textEje = 50;

        group.selectAll('.bar')
            .data(numTotalBedrooms)
            .enter()
            .append('rect')
            .attr("class", "bar")
            .attr('x', function (data, i) {
                return stepsX * (i + 1);
            })
            .attr('y', function (data) {
                return scaleY(data);
            })
            .attr("width", widhtGrafic)
            .attr("height",  function (data) {
                   return height - scaleY(data) - border
            });
        
        group.append('text')
            .attr('x', width / 2 + border )
            .attr('y', height - textEje )
            .text('Numero de habitaciones');

        group.append('text')
            .attr("transform", "rotate(-90)")
            .attr("y", textEje)
            .attr("x", -(width / 2))
            .text('Numero de propiedades');

        group.append('text')
            .attr('x', width / 2 + (2 * border))
            .attr('y', textEje )
            .text("" + d.properties.name);
        
    });
};