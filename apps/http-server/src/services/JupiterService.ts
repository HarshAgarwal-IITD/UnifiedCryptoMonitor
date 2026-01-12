import axios from "axios";
import { UnifiedToken , FetchOptions } from "@repo/common";
import dotenv from "dotenv";
dotenv.config();

export class JupiterService {
     public async fetchTrendingPools(fetchOptions:FetchOptions): Promise<UnifiedToken[]> {
        try {  
            const { data } = await axios.get(`${process.env.JUPITER_BASE_URL}toptrending/24h`,
                {
                    headers:{
                        "x-api-key":`${process.env.JUPITER_API_KEY}`
                    }
                }
            );
            
            const jupiterTokens:UnifiedToken[] = data.map((token:any) => {
                // Calculate total 24h volume (Buy + Sell)
                const vol24 = (token.stats24h?.buyVolume || 0) + (token.stats24h?.sellVolume || 0);

                return {
                    name: token.name,
                    symbol: token.symbol,
                    address: token.id, // Jupiter returns address as 'id'
                    price: token.usdPrice || 0,
                    
                    volume24h: vol24, 
                    marketCap: token.mcap || 0,
                    
                    // Extract price changes safely
                    priceChange24h: token.stats24h?.priceChange || 0,
                    priceChange6h: token.stats6h?.priceChange || 0,
                    priceChange1h: token.stats1h?.priceChange || 0,
                    
                    source: "jupiter"
                };
            });
            
            return jupiterTokens;
        } catch (error) {
            console.error("Error fetching from Jupiter:", error);
            return [];
        }
       
        
       
    }
    public async fetchToken(addresses:string[]):Promise<UnifiedToken[]>{
        try{
            const {data} = await axios.get(`${process.env.JUPITER_BASE_URL}search?query=${addresses.join(",")}`,{
                headers:{
                    "x-api-key":`${process.env.JUPITER_API_KEY}`
                }
            })
            return data.map((token:any)=>{
                const vol24 = (token.stats24h?.buyVolume || 0) + (token.stats24h?.sellVolume || 0);
                return {
                    name: token.name,
                    symbol: token.symbol,
                    address: token.id, // Jupiter returns the mint address as 'id'
                    price: token.usdPrice,
                    volume24h: vol24,
                    marketCap: token.mcap,
                    
                    // Use optional chaining in case specific time-frame stats are missing
                    priceChange1h: token.stats1h?.priceChange || 0,
                    priceChange6h: token.stats6h?.priceChange || 0,
                    priceChange24h: token.stats24h?.priceChange || 0,
                    priceChange7d: token.stats7d?.priceChange || 0,
                    
                    source: "jupiter"
                };
            });
        }catch(error){
            console.error("Error fetching from Jupiter:", error);
            return [];
        }
    }
}
