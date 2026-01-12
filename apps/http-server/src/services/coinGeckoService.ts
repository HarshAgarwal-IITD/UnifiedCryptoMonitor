import axios from "axios";
import { UnifiedToken,  FetchOptions } from "@repo/common"; 
import dotenv from "dotenv";
dotenv.config();

export class CoinGeckoService {
    async  fetchTrendingPools(fetchOptions:FetchOptions):Promise<UnifiedToken[]>{
        try {
            const { data } = await axios.get(`${process.env.COIN_GECKO_BASE_URL}/trending_pools`);
           
            const coinGeckoTokens:UnifiedToken[] = data.data.map((item: any) => {
                    const attr = item.attributes;

                    // Gecko returns ID as "solana_ADDRESS", we need to strip the prefix
                    const rawAddress = item.relationships.base_token.data.id || "";
                    const cleanAddress = rawAddress.replace("solana_", "");

                return {
                        name: attr.name || "Unknown",
                        symbol: attr.symbol || "UNKNOWN",
                        address: cleanAddress,

                        // Convert String Strings to Numbers (Gecko sends strings to preserve precision)
                        price: parseFloat(attr.base_token_price_usd || "0"),
                        
                        // Volume is nested inside volume_usd object
                        volume24h: parseFloat(attr.volume_usd?.h24 || "0"),

                        // FDV is the best proxy for Market Cap in GeckoTerminal
                        marketCap: parseFloat(attr.fdv_usd || "0"),

                        // Price Changes (Safe Navigation ?. is crucial here)
                        priceChange24h: parseFloat(attr.price_change_percentage?.h24 || "0"),
                        priceChange1h: attr.price_change_percentage?.h1 
                            ? parseFloat(attr.price_change_percentage.h1) 
                            : undefined,
                        priceChange6h: attr.price_change_percentage?.h6 
                            ? parseFloat(attr.price_change_percentage.h6)
                            : undefined,
                        source: "coin_gecko"
                    };
            });

            return coinGeckoTokens;
        } catch (err) {
            console.error("CoinGecko Fetch Failed:", err);
            return [];
        }
    }

    async fetchTokenData(address: string): Promise<UnifiedToken | null> {
        try {
            // Fetch pools for the token to get the most liquid one or just basic token info
            // GeckoTerminal /tokens/{address} gives price and some stats
            const { data } = await axios.get(`${process.env.COIN_GECKO_BASE_URL}tokens/multi/${address}`);
            
            const attr = data.data.attributes;
            
            return {
                name: attr.name || "Unknown",
                symbol: attr.symbol || "UNKNOWN",
                address: address, // Input address
                price: parseFloat(attr.price_usd || "0"),
                volume24h: parseFloat(attr.volume_usd?.h24 || "0"),
                marketCap: parseFloat(attr.fdv_usd || "0"),
                source: "coin_gecko"
            }
         } catch (error) {
            console.error("Error fetching token from CoinGecko:", error);
            return null;
        }
    }
    
}

