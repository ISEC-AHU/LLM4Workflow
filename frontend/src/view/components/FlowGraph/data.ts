/*
 * @Author: Weilin Du
 * @Date: 2024-06-20 10:16:29
 * @LastEditors: Weilin Du
 * @LastEditTime: 2024-06-20 11:04:39
 * @FilePath: \workflow-frontend\src\view\components\FlowGraph\data.ts
 * @Description:
 */

import { XMLParser } from 'fast-xml-parser';

const xmlData = `
<?xml version="1.0" encoding="GB2312"?>
<adga jobCount="8" version="1.0">
    <job id="1" name="Read historical climate data"></job>
    <job id="2" name="Read future climate data"></job>
    <job id="3" name="Convert historical climate data"></job>
    <job id="4" name="Convert future climate data"></job>
    <job id="5" name="Adjust resolution of future climate data"></job>
    <job id="6" name="Multiply cell values"></job>
    <job id="7" name="Merge climate data"></job>
    <job id="8" name="Visualize combined dataset"></job>
    <child ref="3">
        <parent ref="1" />
    </child>
    <child ref="4">
        <parent ref="2" />
    </child>
    <child ref="5">
        <parent ref="4" />
    </child>
    <child ref="6">
        <parent ref="5" />
    </child>
    <child ref="7">
        <parent ref="3" />
        <parent ref="6" />
    </child>
    <child ref="8">
        <parent ref="7" />
    </child>
</adga>
`;

const parseXMLToFlow = async (
  xml: string
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseAttributeValue: true,
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      return ['job', 'child', 'parent'].includes(name);
    },
  });
  const result = parser.parse(xml);

  const nodes: Node[] = result.adga.job.map((job: Job) => {
    const isRootNode = result.adga.child.every((child: Child) => {
      return child.ref !== job.id;
    });
    if (isRootNode)
      return {
        id: `${job.id}`,
        data: { label: job.name },
        type: 'input',
      };
    return {
      id: `${job.id}`,
      data: { label: job.name },
    };
  });

  const edges: Edge[] = result.adga.child.flatMap((child: Child) => {
    const parents = Array.isArray(child.parent) ? child.parent : [child.parent];
    return parents.map((parent: Parent) => ({
      id: `e${parent.ref}${child.ref}`,
      source: `${parent.ref}`,
      target: `${child.ref}`,
      type: 'smoothstep',
      animated: true,
    }));
  });
  return { nodes, edges };
};
