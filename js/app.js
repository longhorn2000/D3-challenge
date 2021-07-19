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

            // Step 5:- Create axes labels
            // // Step 5. 1 Axes label group for x & y axis
            var xLabelGroup = chartGroup.append("g").attr("transform", `translate(${width/2}, ${height})`);
            var yLabelGroup = chartGroup.append("g")
                                        .attr("transform", "rotate(-90)");
                                        
            // // Step 5. 2 Render axes labels
            var povertyLabel = xLabelGroup.append("text")
                                        .attr("x", 0)
                                        .attr("y", 3.5*labelGap)
                                        .attr("value", "poverty")
                                        .classed("active", chosenXAxis=="poverty"?true:false)
                                        .classed("inactive", chosenXAxis!="poverty"?true:false)
                                        .text("In poverty (%)");

            var ageLabel = xLabelGroup.append("text")
                .attr("x", 0)
                .attr("y", 5*labelGap)
                .attr("value", "age")
                .classed("active", chosenXAxis=="age"?true:false)
                .classed("inactive", chosenXAxis!="age"?true:false)
                .text("Age (Median)");

            var incomeLabel = xLabelGroup.append("text")
                .attr("x", 0)
                .attr("y", 6.5*labelGap)
                .attr("value", "income")
                .classed("active", chosenXAxis=="income"?true:false)
                .classed("inactive", chosenXAxis!="income"?true:false)
                .text("Household Income (Median)");

            var healthcareLabel = yLabelGroup.append("text")
                .attr("x", 0 - (height / 2))
                .attr("y", -3*labelGap)
                .attr("value", "healthcare")
                .classed("active", chosenYAxis=="healthcare"?true:false)
                .classed("inactive", chosenYAxis!="healthcare"?true:false)
                .text("Lacks Healthcare (%)");
            
            var smokesLabel = yLabelGroup.append("text")
                .attr("x", 0 - (height / 2))
                .attr("y", -4.5*labelGap)
                .attr("value", "smokes")
                .classed("active", chosenYAxis=="smokes"?true:false)
                .classed("inactive", chosenYAxis!="smokes"?true:false)
                .text("Smokes (%)");

            var obesityLabel = yLabelGroup.append("text")
                .attr("x", 0 - (height / 2))
                .attr("y", -6*labelGap)
                .attr("value", "obesity")
                .classed("active", chosenYAxis=="obesity"?true:false)
                .classed("inactive", chosenYAxis!="obesity"?true:false)
                .text("Obese (%)");

            // Step 6:- Create ToolTip
            gGroup = renderTooltip(gGroup, chosenXAxis, chosenYAxis);

            //Update card
            //console.log(`${chosenXAxis}_${chosenYAxis}`);
            d3.selectAll(".card").classed("card-active", false);
            d3.select(`#${chosenXAxis}_${chosenYAxis}`).classed("card-active", true);
            return [gGroup, circlesGroup, textGroup, xLabelGroup, yLabelGroup, xAxis, yAxis, xScale, yScale];
        }
    
        function modifyChart(data, gGroup, circlesGroup, textGroup, xLabelGroup, yLabelGroup, xAxis, yAxis, xScale, yScale, chosenXAxis, chosenYAxis, axis){
            
            if(axis=="x"){
                //Step 1:- Create scales
                var xScale = scale(data, chosenXAxis, false);
                //Step 2:- Axis Transition
                // updates x axis with transition
                //Change the format of ticks if screen width is less that 530 and value is "income" to avoid crowding
                if((chosenXAxis == 'income') && (svgWidth<530)){
                    var bottomAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2s"));;         
                }else{
                    var bottomAxis = d3.axisBottom(xScale);
                }
                
                xAxis.transition()
                    .duration(1000)
                    .call(bottomAxis);

                //Step 3:- Transition circles
                circlesGroup.transition()
                    .duration(1000)
                    .attr("cx", d => xScale(d[chosenXAxis]));
                //Step 4:- Update tooltip
                gGroup = renderTooltip(gGroup, chosenXAxis, chosenYAxis);

                //Step5:- Transition Texts
                textGroup.transition()
                    .duration(1000)
                    .attr("x", d=>xScale(d[chosenXAxis]));
                    


            }else{
                //Step 1:- Create scales
                var yScale = scale(data, chosenYAxis, true);
                //Step 2:- Axis Transition
                // updates x axis with transition
                var leftAxis = d3.axisLeft(yScale);
                yAxis.transition()
                    .duration(1000)
                    .call(leftAxis);
                //Step 3:- Transition circles
                circlesGroup.transition()
                    .duration(1000)
                    .attr("cy", d => yScale(d[chosenYAxis]));
                //Step 4:- Update tooltip
                gGroup = renderTooltip(gGroup, chosenXAxis, chosenYAxis);

                //Step5:- Transition Texts
                textGroup.transition()
                    .duration(1000)
                    .attr("y", d=>yScale(d[chosenYAxis])+radius*0.35);
                    
            }
            
            
            
        
                
                
                



