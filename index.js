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
    console.log()
    if (stream) {
        if (!prevStream) {
            console.log(`${stream.userDisplayName} just went live with title: ${stream.title}`);
        }
    } else {
        const user = await apiClient.helix.users.getUserById(userId);
        console.log(`${user.displayName} just went offline`);
    }
    prevStream = stream ?? null;
});

});


bot.login(config.TOKEN);