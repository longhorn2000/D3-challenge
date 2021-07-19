var start, delta=500, timeout;//While resizing window, we shouldn't consider the changes happening within delta
function renderGraph(X, Y){

    if (new Date - start < delta) {
        setTimeout(renderGraph, delta, X, Y);
    } else {

        //console.log(X,Y);
        //Step3:- Scale function
        function scale(data, chosenXAxis, y=true){
            // Input:- data, chosenXAxis(attribute in the data)
            // Output:- Linear scale
            // y: Indicates y axis or not
            var upper = (y) ? [height,0]: [0,width];
            var linearScale = d3.scaleLinear()
                                .domain([d3.min(data, d=>d[chosenXAxis])*0.9, d3.max(data, d=>d[chosenXAxis])*1.1])
                                .range(upper)
            
            return linearScale;
        }

        //Step6:- Render ToolTip
        // Creates and Render tooltip 
        //Returns the group with rendered tooltip
        function renderTooltip(gGroup, chosenXAxis, chosenYAxis){
            
            var toolTip = d3.tip()
                            .attr("class", "d3-tip")
                            .offset([-10,0])
                            .html(function(d){
                                return (`${d.state}<hr>${chosenXAxis}:${d[chosenXAxis]}<br>${chosenYAxis}:${d[chosenYAxis]}`);
                            });
            
            gGroup.call(toolTip);
            
            //Show and hide tooltip
            gGroup.on("mouseover", function(d){
                toolTip.show(d, this);
            }).on("mouseout", function(d){
                toolTip.hide();
            })
            return gGroup;
        }

        function updateChart(data, chosenXAxis, chosenYAxis){
            //Step 1:- Create scales
            var xScale = scale(data, chosenXAxis, false);
            var yScale = scale(data, chosenYAxis, true);

            //Step 2:- Create left and bottom axes
            var bottomAxis = d3.axisBottom(xScale);
            // updates x axis with transition
            //Change the format of ticks if screen width is less that 530 and value is "income" to avoid crowding
            if((chosenXAxis == 'income') && (svgWidth<530)){
                var bottomAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2s"));;         
            }else{
                var bottomAxis = d3.axisBottom(xScale);
            }
            var leftAxis = d3.axisLeft(yScale);

            //Step 3:- Render axes 
            var xAxis = chartGroup.append("g")
                                    .attr("transform", `translate(0, ${height})`)
                                    .attr("font-size", labelGap)
                                    .call(bottomAxis);
                                    


            var yAxis = chartGroup.append("g")
                                .call(leftAxis);

            // Step 4:- Render circles
            var gGroup = chartGroup.selectAll("circle")
                                        .data(data)
                                        .enter()
                                        .append("g")
                                        .attr("class", "circ");
            
            var circlesGroup = gGroup.append("circle")
                .attr("cx", d=>xScale(d[chosenXAxis]))
                .attr("cy", d=>yScale(d[chosenYAxis]))
                .attr("r", radius)
                .attr("fill", "red")
                .attr("opacity", ".5");
                                        
            var textGroup = gGroup.append("text")
                .attr("x", d=>xScale(d[chosenXAxis]))
                .attr("y", d=>yScale(d[chosenYAxis])+radius*0.35)
                .attr("class", "aText")
                .attr("fill", "white")
                .text(d=>d["abbr"]);  
                
                



