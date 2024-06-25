/*
 * @Author: Weilin Du
 * @Date: 2024-06-19 20:06:17
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-20 11:18:08
 * @FilePath: \workflow-frontend\src\view\components\FlowGraph\FlowChart.tsx
 * @Description:
 */

import { useEffect, useRef } from 'react';

import { Graph } from '@antv/g6';
import { XMLParser } from 'fast-xml-parser';

// const xmlData = `
// <?xml version="1.0" encoding="UTF-8"?>
// <adga jobCount="8" version="1.0">
//     <job id="1" name="Read historical climate data"></job>
//     <job id="2" name="Read future climate data"></job>
//     <job id="3" name="Convert historical climate data"></job>
//     <job id="4" name="Convert future climate data"></job>
//     <job id="5" name="Adjust resolution of future climate data"></job>
//     <job id="6" name="Multiply cell values"></job>
//     <job id="7" name="Merge climate data"></job>
//     <job id="8" name="Visualize combined dataset"></job>
//     <child ref="3">
//         <parent ref="1" />
//     </child>
//     <child ref="4">
//         <parent ref="2" />
//     </child>
//     <child ref="5">
//         <parent ref="4" />
//     </child>
//     <child ref="6">
//         <parent ref="5" />
//     </child>
//     <child ref="7">
//         <parent ref="3" />
//         <parent ref="6" />
//     </child>
//     <child ref="8">
//         <parent ref="7" />
//     </child>
// </adga>
// `;

const parseXMLToGraphData = (xmlData: string) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    isArray: (name) => {
      return ['job', 'child', 'parent'].includes(name);
    },
  });
  const parsedData = parser.parse(xmlData);
  const nodes = [];
  const edges = [];

  // 解析 job 节点，生成 nodes
  const jobs = parsedData.adga.job;
  jobs.forEach((job) => {
    const id = String(job.id);
    const label = job.name;
    nodes.push({ id, label });
  });

  // 解析 child 和 parent 节点，生成 edges
  const children = parsedData.adga.child;
  children.forEach((child) => {
    const childId = child.ref;
    const parents = child.parent;
    parents.forEach((parent) => {
      const parentId = parent.ref;
      edges.push({ source: String(parentId), target: String(childId) });
    });
  });

  return { nodes, edges };
};

const FlowGraph = ({ width = '100%', height = 300, xmlData }) => {
  const containerRef = useRef(null);
  const graphRef = useRef<Graph>();

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.scrollWidth;
    const height = containerRef.current.scrollHeight || 500;
    if (!graphRef.current) {
      graphRef.current = new Graph({
        container: containerRef.current,
        width,
        height,
        autoFit: 'view',
        behaviors: ['drag-canvas', 'drag-node'],
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          align: 'UL',
          controlPoints: true,
          nodesepFunc: () => 1,
          ranksepFunc: () => 1,
        },
        node: {
          type: 'rect',
          style: {
            size: [60, 20],
            lineWidth: 2,
            stroke: '#5B8FF9',
            fill: '#C6E5FF',
            labelText: (d) => d.id,
            labelPlacement: 'center',
          },
        },
        edge: {
          type: 'polyline',
          style: {
            endArrow: true,
          },
        },
        data: parseXMLToGraphData(xmlData),
      });
      graphRef.current.render();
    }

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width, height }} />;
};

export default FlowGraph;
