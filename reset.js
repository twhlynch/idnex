import fetch from 'node-fetch';

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = "1048213818775437394";

async function resetCommands() {
    const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${token}`
        },
        method: 'PUT',
        body: JSON.stringify([])
    });

    if (response.ok) {
        console.log('Reset commands');
    } else {
        console.error('Error resetting commands');
        const text = await response.text();
        console.error(text);
    }
}

async function leaveGuilds() {
    const url = `https://discord.com/api/v10/users/@me/guilds`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${token}`
        },
        method: 'GET'
    });
    const guilds = response.json();

    for (const guild of guilds) {
        const url = `https://discord.com/api/v10/users/@me/guilds/${guild.id}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bot ${token}`
            },
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`Left guild ${guild.id}`);
        } else {
            console.error(`Error leaving guild ${guild.id}`);
            const text = await response.text();
            console.error(text);
        }
    }
}

await resetCommands();
await leaveGuilds();