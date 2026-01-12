import Redis from 'ioredis';

// Standard connection string format: "redis://:password@host:port/db"
const REDIS_URL ='redis://localhost:6379';

// 1. The Generic Client (for simple Get/Set)
export const redisClient = new Redis(REDIS_URL);

// 2. The Publisher (for the Worker to send updates)
export const redisPublisher = new Redis(REDIS_URL);

// 3. The Subscriber (for the WS server to listen)
export const redisSubscriber = new Redis(REDIS_URL);
