import { WebSocketServer } from 'ws';
import { redisSubscriber } from '@repo/common/redis'; // Import from shared

const wss = new WebSocketServer({ port: 8080 });

// 1. Subscribe to the channel
redisSubscriber.subscribe('token_updates', (err, count) => {
    if (err) console.error("Failed to subscribe: %s", err.message);
});

// 2. When a message arrives from the HTTP server...
redisSubscriber.on('message', (channel, message) => {
    if (channel === 'token_updates') {
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // 1 = OPEN
                client.send(message);
            }
        });
    }
});

console.log("WebSocket Server running on 8080");