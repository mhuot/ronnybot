module.exports = (robot) ->

  robot.hear /badger/i, (res) ->
   res.send "Badgers? BADGERS? WE DON'T NEED NO STINKIN BADGERS"
  #
  robot.respond /open the (.*) doors/i, (res) ->
    doorType = res.match[1]
    if doorType is "pod bay"
      res.reply "I'm afraid I can't let you do that."
    else
      res.reply "Opening #{doorType} doors"
  #
  robot.hear /I like pie/i, (res) ->
    res.emote "makes a freshly baked pie"
  #

  robot.hear /alarms/, (res) ->
    res.send robot.http("https://demo:demo@demo.opennms.org/opennms/rest/alarms?comparator=ge&severity=MAJOR").get() (err, response, body) -> res.send "Got back #{body}"
