import { CoinGeckoService } from "./services/coinGeckoService";
import { JupiterService } from "./services/JupiterService";

import { UnifiedToken , FetchOptions,sortTokens } from "@repo/common";
import { redisClient, redisPublisher } from "@repo/common/redis";
import { normalizeTokenData} from "./utils/tokenUtils";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const coinGeckoService = new CoinGeckoService();
const jupiterService = new JupiterService();

async function startPolling() {
    console.log("Worker started...");
   await runDiscoveryTask();

    setInterval(async () => {
        await runDiscoveryTask();
    }, 5000); // Poll every 5 seconds
}

async function runDiscoveryTask() {
    try {
        // Pass empty options to fetch the "Master List"
        const data = await discover({}); 

        if (data.length === 0) {
            console.warn("Discovery returned no data, skipping update");
            return;
        }

        // Cache the raw master list
        await redisClient.set('token_data', JSON.stringify(data), 'EX', 600);

        await redisPublisher.publish('token_updates', JSON.stringify(data));
        console.log("Updated Redis and Published event");
    } catch (e) {
        console.error("Polling error:", e);
    }
}


async function discover(fetchOptions:FetchOptions){
    const coinGeckoTokens = await coinGeckoService.fetchTrendingPools(fetchOptions);
    const addresses = coinGeckoTokens.map((token) => token.address);
    const jupiterTokens = await jupiterService.fetchToken(addresses);
    const mergedTokens = normalizeTokenData(coinGeckoTokens, jupiterTokens);
    const sortedTokens = sortTokens(mergedTokens, fetchOptions);
    return removeDuplicateTokens(sortedTokens);
}

function removeDuplicateTokens(tokens: UnifiedToken[]): UnifiedToken[] {
    const seen = new Set<string>();
    return tokens.filter(token => {
        if (seen.has(token.address)) {
            return false;
        }
        seen.add(token.address);
        return true;
    });
}

app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/discover", async (req, res) => {
    const fetchOptions:FetchOptions =req.query;
    const cachedData = await redisClient.get('token_data');
    if(cachedData){
        const tokens = JSON.parse(cachedData) as UnifiedToken[];
        return res.send(sortTokens(tokens,fetchOptions));
    }
    const sortedTokens = await discover(fetchOptions);
    return res.send(sortedTokens);
    
});

app.listen(3003, () => {
    console.log("Server is running on port 3003");
});
startPolling();
