const { Client } = require('discord.js');
const fs = require('fs');

const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const { WebHookListener } = require('twitch-webhooks');
const { NgrokAdapter } = require('twitch-webhooks-ngrok');

const config = require('./_data/config.json');
const bot = new Client;

const prefix = config.PREFIX;
const clientId = config.TWITCH_CLIENT_ID;
const clientSecret = config.TWITCH_CLIENT_SECRET;
const userId = config.TWITCH_USER_ID;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const listener = new WebHookListener(apiClient, new NgrokAdapter(), { hookValidity: 60 });


bot.once('ready', async () => {
    console.log(`############################################################


            Logged in as ${bot.user.tag}!


############################################################`);

    await listener.listen();
    let prevStream = await apiClient.helix.streams.getStreamByUserId(userId);

    const subscription = await listener.subscribeToStreamChanges(userId, async stream => {
        if (stream) {
            if (!prevStream) {
                const user = await apiClient.helix.users.getUserById(userId);
                const guild = bot.guilds.cache.get('544300325801164820');
                const channel = guild.channels.cache.get(config.NOTIFICATION_CHANNEL_ID);

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
                            }/* ,
                        {
                            "name": "Langue",
                            "value": stream.language ?? 'FR',
                            "inline": true
                        } */
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

                //console.log(`${stream.userDisplayName} just went live with title: ${stream.title}`);
            }
        } else {
            //const user = await apiClient.helix.users.getUserById(userId);
            //console.log(`${user.displayName} just went offline`);
        }
        prevStream = stream ?? null;
    });

});


bot.login(config.TOKEN);