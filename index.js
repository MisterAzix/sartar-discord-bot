const { Client, Collection } = require('discord.js');
const fs = require('fs');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { ReverseProxyAdapter, WebHookListener } = require('twitch-webhooks');
const { NgrokAdapter } = require('twitch-webhooks-ngrok');
const dayjs = require('dayjs');

const bot = new Client;
const config = require('./_data/config.json');
bot.prefix = config.PREFIX;
bot.userID = config.TWITCH_USER_ID;
bot.notifChannel = config.NOTIFICATION_CHANNEL_ID;

const clientId = config.TWITCH_CLIENT_ID;
const clientSecret = config.TWITCH_CLIENT_SECRET;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });
bot.apiClient = apiClient;
//const listener = new WebHookListener(apiClient, new NgrokAdapter(), { hookValidity: config.HOOK_VALIDITY });
const listener = new WebHookListener(apiClient, new ReverseProxyAdapter({
    hostName: 'maxencebreuilles.tech'
}));

bot.commands = new Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once('ready', async () => {
    console.log(`############################################################


            Logged in as ${bot.user.tag}!


############################################################`);

    await listener.listen();
    let prevStream = await apiClient.helix.streams.getStreamByUserId(bot.userID);

    bot.user.setActivity(`${bot.users.cache.size} Avengers`, { type: 'WATCHING' });
    let activity = setInterval(() => {
        bot.user.setActivity(`${bot.users.cache.size} Avengers`, { type: 'WATCHING' });
    }, (1000 * 60 * 60));

    const subscription = await listener.subscribeToStreamChanges(bot.userID, async stream => {
        if (stream) {
            if (!prevStream) {
                const user = await apiClient.helix.users.getUserById(bot.userID);
                const guild = bot.guilds.cache.get(config.GUILD_ID);
                const channel = guild.channels.cache.get(bot.notifChannel);

                clearInterval(activity);
                bot.user.setActivity(stream.title, { type: "STREAMING", url: `https://www.twitch.tv/${user.displayName}` });

                stream.getGame().then(g => {
                    let embed = {
                        "title": stream.title ?? 'Aucun titre trouvé',
                        "url": `https://www.twitch.tv/${user.displayName}`,
                        "color": 4721180,
                        "fields": [
                            {
                                "name": "Jeu",
                                "value": g.name ?? 'Non renseigné',
                                "inline": true
                            },
                            {
                                "name": "Viewers",
                                "value": stream.viewers ?? 0,
                                "inline": true
                            }
                        ],
                        "author": {
                            "name": user.displayName,
                            "url": `https://www.twitch.tv/${user.displayName}`,
                            "icon_url": user.profilePictureUrl
                        },
                        "footer": {
                            "text": `Rejoins moi maintenant : https://www.twitch.tv/${user.displayName}`
                        },
                        "image": {
                            "url": `https://static-cdn.jtvnw.net/previews-ttv/live_user_${stream.userName}-960x540.jpg`
                        }
                    }

                    channel.send(`Hey @everyone ! **${user.displayName}** est maintenant en direct sur https://www.twitch.tv/${user.displayName} ! Allez y jeter un oeil !`, { embed: embed });
                });

                console.log(`[${dayjs('HH:mm:ss')}] ${stream.userDisplayName} just went live with title: ${stream.title}`);
            }
        } else {
            activity = setInterval(() => {
                bot.user.setActivity(`${bot.users.cache.size} Avengers`, { type: 'WATCHING' });
            }, (1000 * 60 * 60));
            const user = await apiClient.helix.users.getUserById(bot.userID);
            console.log(`[${dayjs('HH:mm:ss')}] ${user.displayName} just went offline`);
        }
        prevStream = stream ?? null;
    });

});

bot.on('message', msg => {
    if (!msg.content.startsWith(bot.prefix) || msg.author.bot) return;
    if (msg.member.hasPermission('ADMINISTRATOR') || msg.user.id === config.DEV_ID) {
        let args = msg.content.slice(bot.prefix.length).split(/ +/);
        let command = args.shift().toLowerCase();

        if (bot.commands.find(u => u.name === command)) {
            bot.commands.get(command).execute(bot, msg, args);
        }
    }
});

bot.login(config.TOKEN);