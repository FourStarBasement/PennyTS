import config from './modules/config';
import commands from './commands/index';
import ownerCommands from './commands/owner/index';
import functions from './modules/functions';
import { PresenceStatuses, ActivityTypes } from 'detritus-client/lib/constants';

import { CommandClient } from 'detritus-client';
import mysql from 'mysql';
import events from './events';
import { Range } from 'node-schedule';
const connection = mysql.createConnection({
  host: config.sql.host,
  user: config.sql.username,
  password: config.sql.password,
  database: config.sql.db_name,
});

const cmdClient = new CommandClient(config.token, {
  activateOnEdits: true,
  gateway: {
    presence: {
      activity: {
        name: 'Testing hard!',
        type: ActivityTypes.PLAYING,
      },
      status: PresenceStatuses.ONLINE,
    },
    loadAllMembers: true,
    identifyProperties: {
      $browser: 'Discord iOS',
    },
  },
});

functions(cmdClient, connection);
//cmdClient.addMultipleIn('../src/commands');
cmdClient.addMultiple(commands);
cmdClient.addOwnerOnly(ownerCommands);
cmdClient.addEvents(events);

(async () => {
  const client = await cmdClient.run();
  // client has received the READY payload, do stuff now
  console.log(`Online with ${client.shardCount} shards`);

  const s = require('node-schedule');

  cmdClient.job = s.scheduleJob({ hour: 0, minute: 0 }, () => {
    cmdClient.query('UPDATE `User` SET `CT` = 1');
    cmdClient.query('UPDATE `User` SET `DailyTime` = 1');
  });

  cmdClient.starInterval = s.scheduleJob(
    { second: new Range(0, 59, 2) },
    () => {
      if (cmdClient.starQueue.length < 1) return;
      cmdClient.starQueue.shift()();
    }
  );
})();
