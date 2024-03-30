import { verifyKey } from 'discord-interactions';

export default {
    async fetch(request, env, ctx) {

        const signature = request.headers["x-signature-ed25519"];
        const timestamp = request.headers["x-signature-timestamp"];
        console.log(signature, timestamp);
        const body = request.rawBody;

        const isVerified = signature && timestamp && verifyKey(body, signature, timestamp, env.PUBLIC_KEY);

        if (!isVerified) {
            console.log("invalid request signature");
            return new Response("invalid request signature", {status: 401});
        }

        if (request.json?.type == 1) {
            console.log("PONG");
            return Response.json({
                type: 1
            });
        }
        
        console.log("Command")
        return new Response('Hello World!');

    },
};