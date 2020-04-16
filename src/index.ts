const { CommandClient } = require('detritus-client');
const config = require('./modules/config.json');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: config.sql.host,
    user: config.sql.username,
    password: config.sql.password,
    database: config.sql.db_name,
});

const cmdClient = new CommandClient(config.token, {
    prefix: '!!'
});

cmdClient.onPrefixCheck = async (context) => {
    if (!context.user.bot && context.guildId) {
        let prefix = "pp";
        if (context.message.content.indexOf(prefix) === 0)
            return prefix;
        else
            return false;
    }
}

require('./modules/functions.ts')(cmdClient, connection);
cmdClient.addMultipleIn('/commands');

(async () => {
    const client = await cmdClient.run();
    // client has received the READY payload, do stuff now
    console.log(`Online with ${client.shardCount} shards`);

    const s = require('node-schedule');

    client.job = s.scheduleJob({ hour: 0, minute: 0 }, () => {
        cmdClient.query('UPDATE `User` SET `CT` = 1');
        cmdClient.query('UPDATE `User` SET `DailyTime` = 1');
    });
  })();
