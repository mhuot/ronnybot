const opennms = require('opennms/dist/opennms.node');
const SparkWebSocket = require('ciscospark-websocket-events');
const Botkit = require('botkit');

const accessToken = process.env.SPARK_TOKEN;
if (!accessToken) {
    console.log("No Cisco Spark access token found in env variable SPARK_TOKEN");
    process.exit(2);
}

const PORT = process.env.PORT || 3001;


// Spark Websocket Intialization
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

const Client = opennms.Client;
const Comparators = opennms.API.Comparators;
const Filter = opennms.API.Filter;
const Restriction = opennms.API.Restriction;

const connection = () => new Client().connect('Home', 'https://demo.opennms.org/opennms', 'demo', 'demo');

const alarmCount = () => connection().then(client =>
  client.alarms().find().then(alarms => `There are #{alarms.length} alarms.`)
  ).catch(err => { throw err; });

const nodeCount = () => connection().then(client =>
  client.nodes().find().then(nodes => `There are #{nodes.length} nodes`)
  ).catch(err => { throw err; });

const getNodes = () => connection().then(client =>
  client.nodes().find().then(nodes)
  ).catch(err => { throw err; });

const getAlarms = () => connection().then(client =>
  client.alarms().find().then(alarms)
  ).catch(err => { throw err; });

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

const controller = Botkit.sparkbot({
    debug: true,
    log: true,
    public_address: "https://localhost",
    ciscospark_access_token: accessToken
});

const bot = controller.spawn({
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
  bot.startConversation(message, (errno, convo) => {
    convo.say('Let me check...');
    getAlarms().then(alarms => {
      if (alarms.length > 0) {
        convo.say('Here are the first 10 --');
        alarms.forEach(alarm => {
          convo.say(`Alarm ID ${alarm.id} - ${alarm.description}`);
        })
      } else {
         convo.say(`There are no alarms at this time.`);
      }
      convo.say('---');
    });
  });
});

controller.hears('get nodes', 'direct_message,direct_mention', function (bot, message) {
  bot.startConversation(message, (errno, convo) => {
    convo.say('Let me check...');
    getNodes().then(nodes => {                          
      convo.say('Here are the first 10 --');
      nodes.forEach(node => {
        convo.say(`Node ID ${node.id} - ${node.label}`);
      });
    });
  });
});

controller.on('direct_mention', function (bot, message) {
    bot.reply(message, 'You mentioned me and said, "' + message.text + '"');
});

controller.on('direct_message', function (bot, message) {
    bot.reply(message, 'I got your private message. You said, "' + message.text + '"');
});
