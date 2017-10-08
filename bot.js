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

const connection = async() => new Client().connect('Home', 'https://demo.opennms.org/opennms', 'demo', 'demo');

async function showAlarms  () {
  try {
    const client = await connection();
    const filter = new Filter().withOrRestriction(new Restriction('id', Comparators.GE, 1));
    // query all alarms with an ID greater than or equal to 1
    return await client.alarms().find(filter);
  } catch (err) {
    console.error(err);
  }
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


controller.on('direct_mention', function (bot, message) {
    bot.reply(message, 'You mentioned me and said, "' + message.text + '"');
});

controller.on('direct_message', function (bot, message) {
    bot.reply(message, 'I got your private message. You said, "' + message.text + '"');
});

controller.on('direct_message', function (bot, message) {
    bot.reply(message, 'I got your private message. You said, "' + message.text + '"');
});

controller.hears('show alarms', 'direct_message,direct_mention', function (bot, message) {
  bot.reply(message, 'Let me get the alarms for you...')
  showAlarms().then(alarms => {
    bot.startConversation(message, (errno, convo) => {
      convo.say(`Number of alarms ${alarms.length}`);
      if(alarms.length > 0) {
        convo.say('Here are the alarms - ');
        alarms.forEach((alarm) => {
          console.log(alarm);
          convo.say(`Alarm ID - ${alarm.id.toString()}`);
          convo.say('Alarm description - ' + alarm.description.replace(/\n/gm,""));
        });
      } else {
        msg.reply('Something went wrong.');
      }
      convo.say(`That's all folks!`);
    });
  });
});