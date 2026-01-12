export interface UnifiedToken {
    name: string;
    symbol: string;
    address: string;
    price: number;
    volume24h: number;
    marketCap?: number;
    priceChange7d?: number;
    priceChange24h?: number;
    priceChange6h?: number;
    priceChange1h?: number;
    source: "coin_gecko" | "jupiter" | "aggregated";
}

export interface FetchOptions {
    sortBy?: "volume" | "priceChange" | "marketCap";
    sortOrder?: "asc" | "desc";
    filterPeriod?: "1h" | "24h" | "7d" | "6h";
}

export function sortTokens(tokens: UnifiedToken[], options: FetchOptions): UnifiedToken[] {
    if (!options.sortBy) {
        return tokens;
    }


    return [...tokens].sort((a, b) => {
        let valA = 0;
        let valB = 0;

        switch (options.sortBy) {
            case "volume":
                valA = a.volume24h;
                valB = b.volume24h;
                break;
            case "marketCap":
                valA = a.marketCap || 0;
                valB = b.marketCap || 0;
                break;
            case "priceChange":
                const period = options.filterPeriod || "24h";
                if (period === "1h") {
                    valA = a.priceChange1h || 0;
                    valB = b.priceChange1h || 0;
                } else if (period === "7d") {
                   
                    valA = a.priceChange7d || 0;
                    valB = b.priceChange7d || 0;
                } else if (period === "6h") {
                    valA = a.priceChange6h || 0;
                    valB = b.priceChange6h || 0;
                } else {
                    valA = a.priceChange24h || 0;
                    valB = b.priceChange24h || 0;
                }
                break;
        }

        const sortOrder = options.sortOrder || "asc";
        if (sortOrder === "desc") {
            return valB - valA;
        } else {
            return valA - valB;
        }
    });
}
