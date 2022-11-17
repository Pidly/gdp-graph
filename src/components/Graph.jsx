import { useEffect, useRef } from "react";
import './Graph.css';
import * as d3 from 'd3';

export function Graph() {

    const height = 700;
    const width = 1000;

    const svgRef = useRef();

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw response;
            })
            .then(data => {
                drawGraph(data["data"]);
            })
    }, [])

    const drawGraph = (data) => {
        // Example of the data [[2015-07-01, 18064.7], ...]
        const gdpValues = [];

        const padding = 60;

        data.forEach(item => {
            gdpValues.push(item[1])
        })

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style('background', '#FFFFFF');

        const xScaleBar = d3.scaleBand()
            .domain(gdpValues.map((val, i) => {
                return i;
            }))
            .range([padding, width - padding])
            .padding(0);

        const xTimeScale = d3.scaleTime()
            .domain(d3.extent(data, (date) => { 
                return d3.timeParse("%Y-%m-%d")(date[0]); 
            }))
            .range([padding, width - padding]);

        const yScale = d3.scaleLinear()
            .domain([padding, d3.max(data, (d) => {
                return d[1];
            })])
            .range([height - padding, padding]);

        svg.append("g")
            .attr("transform", "translate(0," + (height - padding) + ")")
            .call(d3.axisBottom(xTimeScale));

        svg.append("g")
            .attr("transform", "translate(" + padding + "," + 0 + ")")
            .call(d3.axisLeft(yScale));

        svg.selectAll('.bar')
            .append("svg:title")
            .text((d) => {return d});
       
        svg.selectAll('.bar')
            .data(data)

            .join("rect")
                .attr("class", "bar")
                .attr('x', (v, i) => {
                    return xScaleBar(i);
                })
                .attr('y', d => yScale(d[1]))
                .attr('width', () => {
                    var xScaleBarBand = xScaleBar.bandwidth();
                    return xScaleBarBand;
                })
                .attr('height', val => {
                    return height - yScale(val[1]) - padding;
                })
                .on('mouseover', (d, i) => {
                    var mouseX = d.pageX;
                    var mouseY = d.pageY;

                    var toolTipWindow = d3.select('.tooltip').node();

                    var toolTipWidth = toolTipWindow.getBoundingClientRect().width;
                    var toolTipHeight = toolTipWindow.getBoundingClientRect().height;

                    var xOffset = mouseX - toolTipWidth / 2;
                    var yOffset = mouseY - toolTipHeight - 50;

                    var x = xOffset;
                    var y = yOffset;

                    d3.select(".tooltip")
                        .style('visibility', 'visible')
                        .style('left', x + "px")
                        .style('top', y + "px")
                        .append("p")
                        .attr("class", "tooltip-info")
                        .append("text")
                        .text("" + i[0])
                        .append("p")
                        .attr("class", "tooltip-info")
                        .append("text")
                        .text(i[1] + " B");
                })
                .on('mouseout', (d, i) => {
                    d3.select(".tooltip-info").remove();
                    d3.select(".tooltip")
                        .style('visibility', 'hidden');
                });       
    }

    return (
        <div className="container">
            <h1>USA GDP</h1>
            <div className="tooltip">
                
            </div>
            <svg ref={svgRef}></svg>
        </div>
    )
}