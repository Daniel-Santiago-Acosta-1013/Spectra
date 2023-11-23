import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './SteganographyVisualization.scss';

const SteganographyVisualization = ({ isStegoDetected }: { isStegoDetected: boolean }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    if (isStegoDetected) {
      const width = 600;
      const height = 400;

      svg.attr('width', width)
         .attr('height', height);

      // Simula datos para representar píxeles y bits incrustados
      const data = Array.from({ length: 100 }, (_, i) => ({
        x: (i % 10) * 60 + 30,
        y: Math.floor(i / 10) * 40 + 20,
        isEncoded: Math.random() > 0.5,
      }));

      svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 18)
        .attr('fill', d => d.isEncoded ? 'red' : 'blue')
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 22)
            .attr('stroke', 'yellow');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 18)
            .attr('stroke', null);
        });
    }
  }, [isStegoDetected]);

  return <svg ref={ref} className="SteganographyVisualization"></svg>;
};

export default SteganographyVisualization;
