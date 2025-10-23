import CONFIG from './config.js';
import UTILS from './utils.js';

import { unbeaten } from './commands/unbeaten.js'
import { trending } from './commands/trending.js'
import { actualTrending } from './commands/actualTrending.js'
import { topTrending } from './commands/topTrending.js'
import { topUnbeaten } from './commands/topUnbeaten.js'
import { newestUnbeaten } from './commands/newestUnbeaten.js'
import { globalStats } from './commands/globalStats.js'
import { leaderboard } from './commands/leaderboard.js'
import { level } from './commands/level.js'
import { id } from './commands/id.js'
import { player } from './commands/player.js'
import { whoIs } from './commands/whoIs.js'
import { random } from './commands/random.js'
import { newest } from './commands/newest.js'
import { oldest } from './commands/oldest.js'
import { getHardest } from './commands/getHardest.js'
import { hardest } from './commands/hardest.js'
import { wiki } from './commands/wiki.js'
import { getLeaderboard } from './commands/getLeaderboard.js'
import { getCreator } from './commands/getCreator.js'
import { getComplexity } from './commands/getComplexity.js'
import { getIterations } from './commands/getIterations.js'
import { getThumbnail } from './commands/getThumbnail.js'
import { script } from './commands/script.js'
import { ask } from './commands/ask.js'
import { echo } from './commands/echo.js'
import { block } from './commands/block.js'
import { unblock } from './commands/unblock.js'
import { checkStolen } from './commands/checkStolen.js'
import { status } from './commands/status.js'

export default {
    async fetch(request, env, ctx) {

        // validate
        const body = await request.text();
        const isVerified = await UTILS.validate(body, request, env);
        if (!isVerified) {
            return new Response("invalid request signature", {status: 401});
        }

        // non-commands
        const json = JSON.parse(body);
        if (json.type == 1) {
            return Response.json({
                type: 1
            });
        }

        // commands
        if (json.type == 2) {
            const command = json.data.name;
            const commands = {
                unbeaten,
                trending,
                "actualtrending": actualTrending,
                "toptrending": topTrending,
                "topunbeaten": topUnbeaten,
                "newestunbeaten": newestUnbeaten,
                "globalstats": globalStats,
                leaderboard,
                level,
                id,
                player,
                "whois": whoIs,
                random,
                newest,
                oldest,
                "gethardest": getHardest,
                hardest,
                wiki,
                "Get leaderboard": getLeaderboard,
                "Get creator": getCreator,
                "Get complexity": getComplexity,
                "Get iterations": getIterations,
                "Get thumbnail": getThumbnail,
                script,
                ask,
                echo,
                block,
                unblock,
                "checkstolen": checkStolen,
                status,
            };
            if (command in commands) {
                const response =  await commands[command](json, env);
                return response;
            }

            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: "Invalid command",
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }

        // failure
        return new Response("invalid request type", {status: 400});
    },
};
