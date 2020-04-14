const { CommandClient } = require('detritus-client');
const config = require('./modules/config.json');

const cmdClient = new CommandClient(config.token, {
    prefix: '!!'
});

cmdClient.onPrefixCheck = async (context) => {
  if (!context.user.bot && context.guildId) {
  let prefix = config.test[context.guild.id];
  if (context.message.content.indexOf(prefix) === 0)
  return prefix;
  else
  return false;
  }
}

require('./modules/functions.ts')(cmdClient);
cmdClient.addMultipleIn('/commands');

(async () => {
    const client = await cmdClient.run();
    // client has received the READY payload, do stuff now
    console.log(`Online with ${client.shardCount} shards`);
  })();
