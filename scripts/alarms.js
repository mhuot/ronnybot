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

function getalarms() {
  return connection().then((client) => {
    return client.alarms().find().then((alarms) => {
      return alarms;
    }); 
  }).catch((err) => {
    console.log('error:',err);
    console.log(err.stack);
    throw err;
  });
}

function ackalarm(msg) {
  id = msg.match[1];
  msg.reply('Let me see if I can find alarm # ' + id);
  const filter = new Filter().withOrRestriction(new Restriction('id', Comparators.EQ, id));
  connection().then((client) => {
    client.alarms().find(filter).then((alarms) => {
      if(alarms.length = 1) {
        alarms.forEach((alarm) => {
          msg.reply('Is this it - ')
          msg.reply(alarm.description);
          msg.reply('Please confirm this is the alarm you would like to ack by saying yes.')
        });
      } else {
        msg.reply('Something went wrong.');
      }
    });
  });
}

module.exports = function(robot) {
  robot.respond(/ack alarm (\d+)/i, function(msg) {
    ackalarm(msg);
  });

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
    msg.reply('Let me check...');
      getalarms().then(function(alarms) {
        if (alarms.length > 0) {
          msg.reply('Here are the first 10 --')
          alarms.forEach((alarm) => {
            msg.reply('Node ID ' + alarm.id + ' - ' + alarm.description);
          });
        } else {
          msg.reply('There are no alarms at this time');
        }
    });
  });
}

