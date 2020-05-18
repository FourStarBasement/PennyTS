import { Context } from 'detritus-client/lib/command';

export const stats = {
  name: 'stats',
  metadata: {
    description: "Penny's various stats.",
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    try {
      let ping = await ctx.client.ping();

      // Shout out to https://github.com/Gravebot/Gravebot/blob/master/src/commands/info/uptime.js for
      // doing the math I didn't wanna do
      const currentUptime = process.uptime();
      const days = Math.floor(currentUptime / (60 * 60 * 24));
      const hours = Math.floor((currentUptime / (60 * 60)) % 24);
      const minutes = Math.floor((currentUptime % (60 * 60)) / 60);
      const seconds = Math.floor(currentUptime % 60);

      ctx.reply({
        embed: {
          title: "Penny's Website",
          author: {
            name: 'PennyBot',
            iconUrl: ctx.me!.avatarUrl,
          },
          color: 9043849,
          footer: {
            text: 'PennyBot by Lilwiggy',
          },
          url: 'https://penny.wiggy.dev',
          fields: [
            {
              name: 'Stats',
              value: `**Uptime:** ${days} days ${hours} hours, ${minutes} minutes, and ${seconds} seconds.
            \n**Ping:** ${ping.gateway}ms
            \n**Total Servers:** ${ctx.client.guilds.cache.size}
            \n**Server Prefix:** ${ctx.prefix}
            \n**FrameWork:** Detritus-client
            \n**NodeJS version:** ${process.version.substr(1)}`,
            },
          ],
        },
      });
    } catch (er) {
      console.log(er);
    }
  },
};
