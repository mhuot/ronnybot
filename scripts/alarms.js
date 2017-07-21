const opennms = require('opennms/dist/opennms.node');

const Client = opennms.Client;
const Comparators = opennms.API.Comparators;
const Filter = opennms.API.Filter;
const Restriction = opennms.API.Restriction;

function data() {
    new Client().connect('Demo', 'https://demo.opennms.org/opennms', 'demo', 'demo').then((client) => {
      const filter = new Filter()
        .withOrRestriction(new Restriction('id', Comparators.GE, 1));
      // query all alarms with an ID greater than or equal to 1
      return client.alarms().then((alarms) => { alarms.length});
    });
}

module.exports = function(robot) {
    robot.respond(/alarms/i, function(msg){
        msg.reply(new Client().connect('Demo', 'https://demo.opennms.org/opennms', 'demo', 'demo').then((client) => {
      const filter = new Filter()
        .withOrRestriction(new Restriction('id', Comparators.GE, 1));
      // query all alarms with an ID greater than or equal to 1
      return client.alarms().length;
    }));
    });
    robot.respond(/getalarms/i, function(msg){
        msg.reply("Here are the 10 most recent alarms - \nAlarm ID - 409058 Severity - Minor Node - marvin.internal.opennms.com Count - 1 Last - Jul 20, 2017 12:15:48 PM Log Message - Update outage identified on interface 172.20.1.17.");
    });
}

