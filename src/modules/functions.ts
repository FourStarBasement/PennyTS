module.exports = (client) => {
    client.fetchGuildMember = (ctx) => {
        let msg = ctx.message;
		let args = msg.content.slice(ctx.prefix.length).split(' ');

		if (!args[1])
			return false;
		let m = msg.mentions.first() || msg.guild.members.get(args[1]) ||
		msg.guild.members.find((m) => m.username.toLowerCase() === args[1].toLowerCase()) ||
		msg.guild.members.find((m) => m.nick.toLowerCase() === args[1].toLowerCase());
		return m;

	};
}