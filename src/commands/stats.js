module.exports = {
    name: 'stats',
    run: async(context) => {
        try {
        let ping = await context.client.ping();

        // Shout out to https://github.com/Gravebot/Gravebot/blob/master/src/commands/info/uptime.js for
        // doing the math I didn't wanna do
        const days = Math.floor(process.uptime() / (60 * 60 * 24));
        const hours = Math.floor(process.uptime() / (60 * 60) % 24);
        const minutes = Math.floor(process.uptime() % (60 * 60) / 60);
        const seconds = Math.floor(process.uptime() % 60);
        context.reply({ embed: {
            title: 'Penny\'s Website',
		author: {
			name: 'PennyBot',
			icon_url: context.client.user.avatarUrl,
		},
		color: 9043849,
		footer: {
			text: 'PennyBot by Lilwiggy'
		},
		url: 'https://penny.wiggy.dev',
		fields: [ {
			name: 'Stats',
			value: `**Uptime:** ${days} days ${hours} hours, ${minutes} minutes, and ${seconds} seconds.
        \n**Ping:** ${ping.gateway}ms
        \n**Total Servers:** ${context.client.guilds.cache.size}
        \n**Server Prefix:** TBA
        \n**FrameWork:** Detritus-client
        \n**NodeJS version:** ${process.version.substr(1)}`
		}
		],
        } });
    } catch (er) {
        console.log(er)
    }
    }
}