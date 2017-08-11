/**
 * Cisco Spark WebSocket example using BotKit
 */

var accessToken = process.env.SPARK_TOKEN;
if (!accessToken) {
    console.log("No Cisco Spark access token found in env variable SPARK_TOKEN");
    process.exit(2);
}

var PORT = process.env.PORT || 3001;


// Spark Websocket Intialization
var SparkWebSocket = require('ciscospark-websocket-events');
sparkwebsocket = new SparkWebSocket(accessToken);
sparkwebsocket.connect(function (err, res) {
    if (!err) {
        sparkwebsocket.setWebHookURL("http://localhost:" + PORT + "/ciscospark/receive");
    }
    else {
        console.log("Error starting up websocket: " + err);
    }
})

//////// OpenNMS //////
const opennms = require('opennms/dist/opennms.node');

const Client = opennms.Client;
const Comparators = opennms.API.Comparators;
const Filter = opennms.API.Filter;
const Restriction = opennms.API.Restriction;


function connection() {
  return new Client().connect('Home', 'http://centos6-1.local:8980/opennms', 'admin', 'admin').then((client) => {
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

//////// Bot Kit //////

var Botkit = require('botkit');

var controller = Botkit.sparkbot({
    debug: true,
    log: true,
    public_address: "https://localhost",
    ciscospark_access_token: accessToken
});

var bot = controller.spawn({
});

controller.setupWebserver(PORT, function (err, webserver) {

    //setup incoming webhook handler
    webserver.post('/ciscospark/receive', function (req, res) {
        res.sendStatus(200)
        controller.handleWebhookPayload(req, res, bot);
    });

});


//
// Bot custom logic
//

controller.hears('hello', 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, 'Hi');
});

controller.hears('get alarms', 'direct_message,direct_mention', function (bot, message) {
    bot.reply(message, 'Let me check...');
    getalarms().then(function(alarms) {
      if (alarms.length > 0) {
        bot.reply(message, 'Here are the first 10 --');
        alarms.forEach((alarm) => {
          bot.reply(message, 'Alarm ID ' + alarm.id + ' - ' + alarm.description);
        });
      } else {
        bot.reply(message, 'There are no alarms at this time');
      }
    });
});

controller.hears('get nodes', 'direct_message,direct_mention', function (bot, message) {
  bot.reply(message, 'Let me check...');
    getnodes().then(function(nodes) {
      bot.reply(message, 'Here are the first 10 --');
      nodes.forEach((node) => {
        bot.reply(message, 'Node ID ' + node.id + ' - ' + node.label);
      });
  });
});

controller.on('direct_mention', function (bot, message) {
    bot.reply(message, 'You mentioned me and said, "' + message.text + '"');
});

controller.on('direct_message', function (bot, message) {
    bot.reply(message, 'I got your private message. You said, "' + message.text + '"');
});
