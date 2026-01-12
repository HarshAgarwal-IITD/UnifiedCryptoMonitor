import { UnifiedToken} from "@repo/common";
const cleanName = (name: string): string => {
    return name.replace(/\s\/\s(SOL|USD|USDC|USDT)$/i, "").trim();
};

export function normalizeTokenData(
    primaryTokens: UnifiedToken[], // CoinGecko (The "Ranked" List)
    secondaryTokens: UnifiedToken[] // Jupiter (The "Real-time" List)
): UnifiedToken[] {
    
    // Performance Optimization: 
    // Since order is guaranteed, we map the Primary list and grab the 
    // corresponding index from the Secondary list directly.
    return primaryTokens.map((primary, index) => {
        const secondary = secondaryTokens[index];

        
        const isMatch = secondary && primary.address === secondary.address;

        if (!isMatch) {
            return { ...primary, source: "coin_gecko" }; 
        }

        return {
            // METADATA: Trust Jupiter. 
            name: cleanName(secondary.name), 
            symbol: secondary.symbol || primary.symbol,
            address: primary.address,

            // PRICE & VOLUME: Trust Jupiter.
            price: secondary.price > 0 ? secondary.price : primary.price,
            volume24h: secondary.volume24h > 0 ? secondary.volume24h : primary.volume24h,

            // MARKET CAP: Trust CoinGecko.
            marketCap: primary.marketCap || secondary.marketCap || 0,

            // PRICE CHANGES: Hybrid Approach.
            priceChange1h: secondary.priceChange1h ?? primary.priceChange1h,
            priceChange6h: secondary.priceChange6h ?? primary.priceChange6h,
            priceChange24h: secondary.priceChange24h ?? primary.priceChange24h,
            priceChange7d: primary.priceChange7d ?? secondary.priceChange7d,

            source: "aggregated"
        };
    });
}