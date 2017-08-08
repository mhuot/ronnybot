const opennms = require('opennms/dist/opennms.node');

const Client = opennms.Client;
const Comparators = opennms.API.Comparators;
const Filter = opennms.API.Filter;
const Restriction = opennms.API.Restriction;


function connection() {
  return new Client().connect('Demo', 'https://demo.opennms.org/opennms', 'demo', 'demo').then((client) => {
    return client;
  });
}

function alarmcount() {
  return connection().then((client) => {
    return client.alarms().find().then((alarms) => {
      return('There are ' + alarms.length + ' alarms.');
    }); 
  }).catch((err) => {
    console.log('error:',err);
    console.log(err.stack);
    throw err;
  });
}

function nodecount() {
  return connection().then((client) => {
    return client.nodes().find().then((nodes) => {
      return('There are ' + nodes.length + ' nodes.');
    }); 
  }).catch((err) => {
    console.log('error:',err);
    console.log(err.stack);
    throw err;
  });
}

function getnodes() {
  return connection().then((client) => {
    return client.nodes().find().then((nodes) => {
      return nodes;
    }); 
  }).catch((err) => {
    console.log('error:',err);
    console.log(err.stack);
    throw err;
  });
}

module.exports = function(robot) {
  robot.respond(/alarm count/i, function(msg){
  	msg.reply('Let me check...');
      alarmcount().then(function(count) {
  		  msg.reply('We got it - ' + count);
    });
  });

//Bogus count of 10 based on limit
  robot.respond(/node count/i, function(msg){
    msg.reply('Let me check...');
      nodecount().then(function(count) {
        msg.reply('We got it - ' + count);
    });
  });

  robot.respond(/node list/i, function(msg){
    msg.reply('Let me check...');
      getnodes().then(function(nodes) {
        msg.reply('Here are the first 10 --')
        nodes.forEach((node) => {
          msg.reply('Node ID ' + node.id + ' - ' + node.label);
        });
    });
  });
  
  robot.respond(/getalarms/i, function(msg){
        msg.reply("Here are the 10 most recent alarms - \nAlarm ID - 409058 Severity - Minor Node - marvin.internal.opennms.com Count - 1 Last - Jul 20, 2017 12:15:48 PM Log Message - Update outage identified on interface 172.20.1.17.");
  });
}

