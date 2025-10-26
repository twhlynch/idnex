import fetch from 'node-fetch';
import { commands } from './commands.js';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = '1048213818775437394';

async function registerCommands() {
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Bot ${token}`,
	};
	const method = 'PUT';

	const applicationUrl = `https://discord.com/api/v10/applications/${applicationId}/commands`;
	const guildUrl = `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`;

	const userCommands = commands.filter((command) => command.contexts);
	const guildCommands = commands.filter((command) => !command.contexts);

	const userResponse = await fetch(applicationUrl, {
		headers,
		method,
		body: JSON.stringify(userCommands),
	});

	const guildResponse = await fetch(guildUrl, {
		headers,
		method,
		body: JSON.stringify(guildCommands),
	});

	if (userResponse.ok && guildResponse.ok) {
		console.log('Registered commands');
	} else {
		console.error('Error registering commands');
		const userText = await userResponse.text();
		const guildText = await guildResponse.text();
		console.error(userText);
		console.error(guildText);
		throw new Error('Error registering commands');
	}
}

await registerCommands();
