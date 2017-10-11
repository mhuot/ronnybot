// Example code of opennms.js using async/await by Alejandro Galue(THANK YOU ALEJANDRO!)
const opennms = require('opennms/dist/opennms.node');

const Client = opennms.Client;
const Comparators = opennms.API.Comparators;
const Filter = opennms.API.Filter;
const Restriction = opennms.API.Restriction;

const showAlarms = async() => {
  try {
    const client = await new Client().connect('Demo', 'https://demo.opennms.org/opennms', 'demo', 'demo');
    const filter = new Filter().withOrRestriction(new Restriction('id', Comparators.GE, 1));
    // query all alarms with an ID greater than or equal to 1
    const alarms = await client.alarms().find(filter);
    console.log(`got ${alarms.length} alarms.`);
    // return all the (unique) node IDs associated with the matching alarms
    const nodeIds = [...new Set(alarms.map(alarm => alarm.nodeId).filter(nodeId => nodeId !== undefined))];
    // for each node ID, request the node info, with ipInterfaces and snmpInterfaces
    const nodes = await Promise.all(nodeIds.map(nodeId => client.nodes().get(nodeId, true)));
    // for each node, print how many interfaces it has
    nodes.forEach(node => console.log(`node ${node.id} (${node.label}) has ${node.ipInterfaces.length} IP interfaces`));
  } catch (err) {
    console.error(err);
  }
}

showAlarms();
