import fetch from 'node-fetch';
import { commands } from './commands.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_GUILD_ID = '1048213818775437394';

const application_url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;
const guild_url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/guilds/${DISCORD_GUILD_ID}/commands`;

const user_commands = commands.filter((command) => command.contexts);
const guild_commands = commands.filter((command) => !command.contexts);

const fetch_options = {
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bot ${DISCORD_TOKEN}`,
	},
};

const [user_res, guild_res] = await Promise.all([
	fetch(application_url, {
		...fetch_options,
		body: JSON.stringify(user_commands),
	}),
	fetch(guild_url, {
		...fetch_options,
		body: JSON.stringify(guild_commands),
	}),
]);

if (user_res.ok && guild_res.ok) {
	console.log('Registered commands');
} else {
	console.error('Error registering commands');
	console.error(await user_res.text());
	console.error(await guild_res.text());
	throw new Error('Error registering commands');
}
