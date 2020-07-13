import config from './modules/config';
import commands from './commands/index';
import ownerCommands from './commands/owner/index';
import functions from './modules/functions';
import { PresenceStatuses, ActivityTypes } from 'detritus-client/lib/constants';

import { CommandClient } from 'detritus-client';
import events from './events';
import { Range } from 'node-schedule';

import pgPromise, { IBaseProtocol } from 'pg-promise';
const pgp = pgPromise();

// TODO: Perhaps make a custom class wrapper for this?
const connection: IBaseProtocol<{}> = pgp(
  `postgres://${config.sql.username}:${config.sql.password}@${config.sql.host}/${config.sql.db_name}`
);

const cmdClient = new CommandClient(config.token, {
  activateOnEdits: true,
  gateway: {
    presence: {
      activity: {
        name: 'Hello everyone!',
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
    cmdClient.query('UPDATE users SET cookie_time = true');
    cmdClient.query('UPDATE users SET daily_time = true');
  });

  cmdClient.starInterval = s.scheduleJob(
    { second: new Range(0, 59, 2) },
    () => {
      if (cmdClient.starQueue.length < 1) return;
      cmdClient.starQueue.shift()();
    }
  );
})();
