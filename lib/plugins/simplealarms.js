'use strict';

var levels = require('../levels');
var times = require('../times');

function init() {

  var simplealarms = {
    name: 'simplealarms'
    , label: 'Simple Alarms'
    , pluginType: 'notification'
  };

  simplealarms.checkNotifications = function checkNotifications(sbx) {
    var lastSGVEntry = sbx.lastSGVEntry()
      , scaledSGV = sbx.scaleEntry(lastSGVEntry)
      ;

    if (scaledSGV && lastSGVEntry && lastSGVEntry.mgdl > 39 && sbx.time - lastSGVEntry.mills < times.mins(10).msecs) {
      var result = simplealarms.compareBGToTresholds(scaledSGV, sbx);
      if (levels.isAlarm(result.level)) {
        sbx.notifications.requestNotify({
          level: result.level
          , title: result.title
          , message: sbx.buildDefaultMessage()
          , eventName: result.eventName
          , plugin: simplealarms
          , pushoverSound: result.pushoverSound
          , debug: {
            lastSGV: scaledSGV, thresholds: sbx.settings.thresholds
          }
        });
      }
    }
  };

  simplealarms.compareBGToTresholds = function compareBGToTresholds(scaledSGV, sbx) {
    var result = { level: levels.INFO };

    if (scaledSGV > sbx.scaleMgdl(sbx.settings.thresholds.bgHigh)) {
      result.level = levels.URGENT;
      result.title = levels.toDisplay(levels.URGENT) + ' MAGAS ⛰️'; // was ' HIGH' - needs to be changed to translate()
      result.pushoverSound = 'climb';
      result.eventName = 'high';
    } else if (scaledSGV > sbx.scaleMgdl(sbx.settings.thresholds.bgTargetTop)) {
      result.level = levels.WARN;
      result.title = levels.toDisplay(levels.WARN) + ' MAGAS ⛰️'; // was ' HIGH' - needs to be changed to translate()
      result.pushoverSound = 'intermission';
      result.eventName = 'high';
    } else if (scaledSGV < sbx.scaleMgdl(sbx.settings.thresholds.bgLow)) {
      result.level = levels.URGENT;
      result.title = levels.toDisplay(levels.URGENT) + ' ALACSONY 📉'; // was ' LOW' - needs to be changed to translate()
      result.pushoverSound = 'alien';
      result.eventName = 'low';
    } else if (scaledSGV < sbx.scaleMgdl(sbx.settings.thresholds.bgTargetBottom)) {
      result.level = levels.WARN;
      result.title = levels.toDisplay(levels.WARN) + ' ALACSONY 📉'; // was ' LOW' - needs to be changed to translate()
      result.pushoverSound = 'pushover';
      result.eventName = 'low';
    }
    return result;
  };

  return simplealarms;

}

module.exports = init;
