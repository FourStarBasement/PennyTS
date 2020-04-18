module.exports = {
	name: 'avatar',
	run: async(context) => {
		let user = context.commandClient.fetchGuildMember(context) || context.message.author;
		context.reply({ embed: {
			title: `${user.username}'s avatar.`,
			image: {
				url: `${user.avatarUrl}?size=2048`
			}
		} });
	}
};