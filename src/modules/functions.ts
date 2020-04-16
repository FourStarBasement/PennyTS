module.exports = (client, connection) => {

    // SQL queries to return promises so we can await them
    client.query = (query) => {
        return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
                if (err || res.length < 1)
                    reject(err || 'Query returned nothing');
                resolve(res);
            });
        });
    };

    // Used for fetching guild member objects easier.
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
