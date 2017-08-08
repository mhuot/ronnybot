const opennms = require('opennms/dist/opennms.node');

const Client = opennms.Client;
const Comparators = opennms.API.Comparators;
const Filter = opennms.API.Filter;
const Restriction = opennms.API.Restriction;


function alarmcount() {
  count = new Client().connect('Demo', 'https://demo.opennms.org/opennms', 'demo', 'demo').then((client) => {
    const filter = new Filter()
      .withOrRestriction(new Restriction('id', Comparators.GE, 1));
    // query all alarms with an ID greater than or equal to 1
    return client.alarms().find(filter).then((alarms) => {
      return('There are ' + alarms.length + ' alarms.');
      }); 
  }).catch((err) => {
    console.log('error:',err);
    console.log(err.stack);
    throw err;
  });
  return count;
}


module.exports = function(robot) {
    robot.respond(/alarm count/i, function(msg){
	msg.reply('Let me check...');
	alarmcount().then(function(count) {
  		msg.reply('We got it - ' + count);
	});
    });
    robot.respond(/getalarms/i, function(msg){
        msg.reply("Here are the 10 most recent alarms - \nAlarm ID - 409058 Severity - Minor Node - marvin.internal.opennms.com Count - 1 Last - Jul 20, 2017 12:15:48 PM Log Message - Update outage identified on interface 172.20.1.17.");
    });
}

