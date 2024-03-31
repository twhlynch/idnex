const nacl = require("tweetnacl");
import { Buffer } from 'node:buffer';

export default {
    async generateLevelEmbed(level, fields = []) {
        return {
            "type": "rich",
            "title": `${level.title}`,
            "description": `${level.description}`,
            "color": 0x618dc3,
            "fields": fields,
            "thumbnail": {
                "url": `https://grab-images.slin.dev/${level?.images?.thumb?.key}`,
                "height": 288,
                "width": 512
            },
            "author": {
                "name": `${level.creator}`,
                "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${level.identifier.split(":")[0]}`,
            },
            "url": `https://grab-tools.live/stats`
        }
    },

    colorComponentToHex(component) {
        const hex = Math.round(component * 255).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    numberWithCommas(x) {
        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    formatTime(seconds, maxDecimals) {
        let minutes = Math.floor(seconds / 60);
        seconds = (seconds % 60).toFixed(maxDecimals);
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return `${minutes}:${seconds}`;
    },

    async fetch(request, env, ctx) {

        const signature = request.headers.get("x-signature-ed25519");
        const timestamp = request.headers.get("x-signature-timestamp");
        const body = await request.text();
        const isVerified = signature && timestamp && nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, "hex"),
            Buffer.from(env.PUBLIC_KEY, "hex")
        );

        if (!isVerified) {
            return new Response("invalid request signature", {status: 401});
        }

        const json = JSON.parse(body);
        if (json.type == 1) {
            return Response.json({
                type: 1
            });
        }

        if (json.type == 2) {
            const command = json.data.name;
            if (command == "unbeaten") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/unbeaten_levels.json");
                const levelData = await levelResponse.json();
                const now = Date.now();
                const description = [];
                levelData.forEach(level => {
                    const daysOld = (now - level?.update_timestamp) / 1000 / 60 / 60 / 24;
                    if (daysOld > 100) {
                        description.push(`**${Math.floor(daysOld)}d** ${level.title}`);
                    }
                });
                const embeds = [{
                    title: `Unbeaten Levels (${levelData.length})`,
                    description: description.join("\n"),
                    color: 0xff0000
                }];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: embeds,
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "trending") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/trending_levels.json");
                const levelData = await levelResponse.json();
                const top5 = levelData.slice(0, 5);
                let description = [];
                top5.forEach((level, index) => {
                    description.push(`**#${index + 1}** ${level.title} - ${level.change}`);
                });
                const embeds = [{
                    title: `Trending Levels`,
                    description: description.join("\n"),
                    color: 0x00ffff
                }];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: embeds,
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "actualtrending") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/trending_levels.json");
                const levelData = await levelResponse.json();
                const top5 = levelData.filter((level) => level.identifier !== "29t798uon2urbra1f8w2q:1693775768" && level.title.toLowerCase().indexOf("yoohoo") == -1 && level.title.toLowerCase().indexOf("diff") == -1).slice(0, 5);
                let description = [];
                top5.forEach((level, index) => {
                    description.push(`**#${index + 1}** ${level.title} - ${level.change}`);
                });
                const embeds = [{
                    title: `Trending Levels`,
                    description: description.join("\n"),
                    color: 0x00ffff
                }];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: embeds,
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "toptrending") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/trending_levels.json");
                const levelData = await levelResponse.json();
                const level = levelData[0];
                const fields = [
                    {
                        "name": `Todays Plays`,
                        "value": `${level.change}`,
                        "inline": true
                    }, {
                        "name": `Total Plays`,
                        "value": `${level.statistics.total_played}`,
                        "inline": true
                    }
                ];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [await this.generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "topunbeaten") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/unbeaten_levels.json");
                const levelData = await levelResponse.json();
                const level = levelData[0];
                const fields = [
                    {
                        "name": `Days Unbeaten`,
                        "value": `${Math.floor((Date.now() - level?.update_timestamp) / 1000 / 60 / 60 / 24)}`,
                        "inline": false
                    }
                ];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [await this.generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "newestunbeaten") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/unbeaten_levels.json");
                const levelData = await levelResponse.json();
                const level = levelData[levelData.length - 1];
                const fields = [
                    {
                        "name": `Days Unbeaten`,
                        "value": `${Math.floor((Date.now() - level?.update_timestamp) / 1000 / 60 / 60 / 24)}`,
                        "inline": false
                    }
                ];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [await this.generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "globalstats") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/all_verified.json");
                const levelData = await levelResponse.json();
                let globalStats = {
                    "plays": 0,
                    "verified_maps": 0,
                    "todays_plays": 0,
                    "average_difficulty": 0,
                    "average_plays": 0,
                    "average_likes": 0,
                    "average_time": 0,
                    "complexity": 0,
                    "iterations": 0,
                    "average_complexity": 0,
                };
                levelData.forEach(level => {
                    globalStats.plays += level.statistics.total_played;
                    globalStats.verified_maps += 1;
                    globalStats.todays_plays += level.change;
                    globalStats.average_difficulty += level.statistics.difficulty;
                    globalStats.average_likes += level.statistics.liked;
                    globalStats.average_time += level.statistics.time;
                    globalStats.complexity += level.complexity;
                    globalStats.iterations += parseInt(level.data_key.split(':')[3]);
                });
                globalStats.average_difficulty /= globalStats.verified_maps;
                globalStats.average_likes /= globalStats.verified_maps;
                globalStats.average_time /= globalStats.verified_maps;
                globalStats.average_plays = globalStats.plays / globalStats.verified_maps;
                globalStats.average_complexity = globalStats.complexity / globalStats.verified_maps;
                const embeds = [{
                    "type": "rich",
                    "title": `Global Stats`,
                    "description": `**Total plays:** ${this.numberWithCommas(globalStats.plays)}\n**Verified maps:** ${this.numberWithCommas(globalStats.verified_maps)}\n**Todays plays:** ${this.numberWithCommas(globalStats.todays_plays)}\n**Total complexity:** ${this.numberWithCommas(globalStats.complexity)}\n**Iterations:** ${this.numberWithCommas(globalStats.iterations)}\n**Average difficulty:** ${Math.round(globalStats.average_difficulty*100)}%\n**Average plays:** ${this.numberWithCommas(Math.round(globalStats.average_plays*100)/100)}\n**Average likes:** ${Math.round(globalStats.average_likes*100)}%\n**Average time:** ${Math.round(globalStats.average_time*100)/100}s\n**Average complexity:** ${this.numberWithCommas(Math.round(globalStats.average_complexity*100)/100)}`,
                    "color": 0x618dc3,
                    "fields": [],
                    "url": `https://grab-tools.live/stats?tab=Global`
                }];
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: embeds,
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "leaderboard") {
                const queryTitle = json.data.options[0].value;
                const queryCreator = json.data.options[1].value;
                const levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&type=search&search_term=${queryTitle}`;
                const levelResponse = await fetch(levelSearch);
                const levelData = await levelResponse.json();
                const foundLevels = []
                for(const level of levelData) {
                    if("creators" in level) {
                        for(const creator of level.creators) {
                            if(creator.toLowerCase().includes(queryCreator.toLowerCase())) {
                                foundLevels.push(level);
                                break;
                            }
                        }
                    }
                }
                foundLevels.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
                if(foundLevels.length >= 1) {
                    const levelID = foundLevels[0].identifier;
                    const leaderboardUrl = `https://api.slin.dev/grab/v1/statistics_top_leaderboard/${levelID.replace(":", "/")}`;
                    const leaderboardResponse = await fetch(leaderboardUrl);
                    const leaderboardData = await leaderboardResponse.json();
                    let description = [];
                    let maxDecimals = 0;
                    leaderboardData.forEach((entry) => {
                        let decimals = entry.best_time.toString().split(".")[1];
                        if (decimals) {
                            maxDecimals = Math.max(maxDecimals, decimals.length);
                        }
                    });
                    for(let i = 0; i < Math.min(10, leaderboardData.length); i++) {
                        description.push(`**${i+1}**. ${leaderboardData[i].user_name} - ${this.formatTime(leaderboardData[i].best_time, maxDecimals)}`);
                    }
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "",
                            embeds: [{
                                "type": "rich",
                                "title": `Leaderboard for ${foundLevels[0].title}`,
                                "description": description.join("\n"),
                                "color": 0x618dc3,
                                "fields": [],
                                "url": `https://grabvr.quest/levels/viewer/?level=${levelID}`
                            }],
                            allowed_mentions: { parse: [] }
                        }
                    });
                } else {
                    return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "Could not find a level with that title and creator",
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
                }
            } else if (command == "player") {
                const queryUsername = json.data.options[0].value;
                const searchUrl = `https://api.slin.dev/grab/v1/list?max_format_version=9&type=user_name&search_term=${queryUsername}`;
                const searchResponse = await fetch(searchUrl);
                const searchData = await searchResponse.json();
                if(searchData.length >= 1) {
                    const userID = searchData[0].user_id;
                    const userName = searchData[0].user_name;
                    const levelCount = searchData[0].user_level_count;
                    const primaryColor = searchData[0]?.active_customizations?.player_color_primary?.color;
                    
                    const levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&user_id=${userID}`;
                    const levelResponse = await fetch(levelSearch);
                    const levelData = await levelResponse.json();

                    let statistics = {
                        "plays": 0,
                        "verified_plays": 0,
                        "maps": 0,
                        "verified_maps": 0,
                        "average_difficulty": 0,
                        "average_plays": 0,
                        "average_likes": 0,
                        "average_time": 0,
                        "complexity": 0,
                    }
                    let userIDInt = [...userID.toString()].reduce((r,v) => r * BigInt(36) + BigInt(parseInt(v,36)), 0n);
                    userIDInt >>= BigInt(32);
                    userIDInt >>= BigInt(32);
                    const joinDate = new Date(Number(userIDInt));
                    const unixTime = Math.floor(joinDate.getTime() / 1000);

                    for (let level of levelData) {
                        if (level?.tags?.includes("ok")) {
                            statistics.verified_maps += 1;
                            statistics.verified_plays += level?.statistics?.total_played || 0;
                        }
                        statistics.plays += level?.statistics?.total_played || 0;
                        statistics.maps += 1;
                        statistics.average_difficulty += level.statistics.difficulty;
                        statistics.average_likes += level?.statistics?.liked || 0;
                        statistics.average_time += level?.statistics?.time || 0;
                        statistics.complexity += level.complexity;
                    }
                    statistics.average_difficulty /= statistics.maps;
                    statistics.average_likes /= statistics.maps;
                    statistics.average_time /= statistics.maps;
                    statistics.average_plays = statistics.plays / statistics.maps;

                    const primaryColorAsHex = `${this.colorComponentToHex(primaryColor[0])}${this.colorComponentToHex(primaryColor[1])}${this.colorComponentToHex(primaryColor[2])}`;

                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "",
                            embeds: [{
                                "type": "rich",
                                "title": `${userName}'s stats`,
                                "description": `**Level Count:** ${this.numberWithCommas(levelCount)}\n**Join Date:** <t:${unixTime}>\n**Verified maps:** ${this.numberWithCommas(statistics.verified_maps)}\n**Total plays:** ${this.numberWithCommas(statistics.plays)}\n**Verified plays:** ${this.numberWithCommas(statistics.verified_plays)}\n**Total complexity:** ${this.numberWithCommas(statistics.complexity)}\n**Average difficulty:** ${Math.round(statistics.average_difficulty*100)}%\n**Average plays:** ${this.numberWithCommas(Math.round(statistics.average_plays*100)/100)}\n**Average likes:** ${Math.round(statistics.average_likes*100)}%\n**Average time:** ${Math.round(statistics.average_time*100)/100}s`,
                                "color": parseInt(primaryColorAsHex, 16),
                                "fields": [],
                                "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${userID}`
                            }],
                            allowed_mentions: { parse: [] }
                        }
                    });
                } else {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Could not find a player with that username",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
            } else if (command == "whois") {
                const queryUsername = json.data.options[0].value;
                const searchUrl = `https://api.slin.dev/grab/v1/list?max_format_version=9&type=user_name&search_term=${queryUsername}`;
                const searchResponse = await fetch(searchUrl);
                const searchData = await searchResponse.json();
                if(searchData.length >= 1) {
                    const userID = searchData[0].user_id;
                    const userName = searchData[0].user_name;
                    let details = {
                        primary: [0,0,0],
                        secondary: [0,0,0],
                        hat: "none",
                        face: "none",
                        head: "default",
                        grapple: "default",
                        hands: "claw",
                        checkpoint: "default",
                        neck: "none",
                        creator: false,
                        moderator: false,
                        verifier: false
                    };
                    const player = searchData[0];
                    if (player.is_verifier) { details.verifier = true; }
                    if (player.is_creator) { details.creator = true; }
                    if (player.is_moderator) { details.moderator = true; }
                    if (player.active_customizations) {
                        if (player.active_customizations?.player_color_primary?.color) {
                            details.primary = player.active_customizations.player_color_primary.color;
                        }
                        if (player.active_customizations?.player_color_secondary?.color) {
                            details.secondary = player.active_customizations.player_color_secondary.color;
                        }
                        if (player.active_customizations.items) {
                            const items = player.active_customizations.items;
                            if (items["head/glasses"]) {details.face = items["head/glasses"].replace("_basic", "").replace("head_glasses_", "").replaceAll("_", " ")}
                            if (items["grapple/hook"]) {details.grapple = items["grapple/hook"].replace("_basic", "").replace("grapple_hook_", "").replaceAll("_", " ")}
                            if (items["head/hat"]) {details.hat = items["head/hat"].replace("_basic", "").replace("head_hat_", "").replaceAll("_", " ")}
                            if (items["checkpoint"]) {details.checkpoint = items["checkpoint"].replace("_basic", "").replace("checkpoint_", "").replaceAll("_", " ")}
                            if (items["head"]) {details.head = items["head"].replace("_basic", "").replace("head_", "").replaceAll("_", " ")}
                            if (items["hand"]) {details.hands = items["hand"].replace("_basic", "").replace("hand_", "").replaceAll("_", " ")}
                            if (items["body/neck"]) {details.neck = items["body/neck"].replace("_basic", "").replace("body_neck_", "").replaceAll("_", " ")}
                        }
                    }
                    const primaryColorAsHex = `${this.colorComponentToHex(details.primary[0])}${this.colorComponentToHex(details.primary[1])}${this.colorComponentToHex(details.primary[2])}`;
                    const secondaryColorAsHex = `${this.colorComponentToHex(details.secondary[0])}${this.colorComponentToHex(details.secondary[1])}${this.colorComponentToHex(details.secondary[2])}`;
                    const roles = [details.moderator, details.creator, details.verifier].map((role, index) => role ? ["Moderator", "Creator", "Verifier"][index] : null).filter(role => role !== null);
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "",
                            embeds: [{
                                "type": "rich",
                                "title": `${userName}'s details`,
                                "description": `**Primary:** #${primaryColorAsHex}\n**Secondary:** #${secondaryColorAsHex}\n**Hat:** ${details.hat}\n**Face:** ${details.face}\n**Head:** ${details.head}\n**Grapple:** ${details.grapple}\n**Hands:** ${details.hands}\n**Checkpoint:** ${details.checkpoint}\n**Neck:** ${details.neck}`,
                                "color": parseInt(primaryColorAsHex, 16),
                                "fields": [],
                                "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${userID}`,
                                "footer": {
                                    "text": roles.join(" | ")
                                }
                            }],
                            allowed_mentions: { parse: [] }
                        }
                    });
                } else {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Could not find a player with that username",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
            } else if(command == "random") {
                const isVerified = json.data.options[0].value;
                let levelUrl = "https://api.slin.dev/grab/v1/get_random_level";
                if (isVerified) {levelUrl += "?type=ok"}
                const levelResponse = await fetch(levelUrl);
                const levelData = await levelResponse.json();
                const url = `https://grabvr.quest/levels/viewer?level=${levelData.identifier}`;
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: url,
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "hardest") {
                const func = json.data.options[0].value;
                if (func == "list") {
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        const listData = JSON.parse(list);
                        const description = [];
                        for (let i = 0; i < 10; i++) {
                            const item = listData[i];
                            description.push(`**${i+1}**. ${item.title}`);
                        }
                        const embeds = [{
                            title: "Hardest Maps List",
                            description: description.join("\n"),
                            color: 0xff0000
                        }];
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: "",
                                embeds: embeds,
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                }
                return new Response("invalid command", {status: 400});
            }
        }

        return new Response("invalid request type", {status: 400});

    },
};