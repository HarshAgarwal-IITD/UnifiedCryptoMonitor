import { UnifiedToken } from "@repo/common";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    }).format(value);
};

const formatPercent = (value?: number) => {
    if (value === undefined) return "-";
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatCompact = (number: number) => {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 2
    }).format(number);
}

export const TokenCard = ({ token }: { token: UnifiedToken }) => {
    const isPositive = (token.priceChange24h || 0) >= 0;

    return (
        <div className="bg-surface border border-white/5 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-surface-hover hover:border-primary/20 hover:shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-white transition-colors">{token.symbol}</h3>
                    <p className="text-sm text-text-secondary mt-1 group-hover:text-text-secondary/80">{token.name}</p>
                </div>
                <div className="text-xl font-mono font-semibold text-text-primary">
                    {formatCurrency(token.price)}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">24h Vol</span>
                    <span className="text-sm font-semibold text-text-primary">${formatCompact(token.volume24h)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">Mkt Cap</span>
                    <span className="text-sm font-semibold text-text-primary">${formatCompact(token.marketCap || 0)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">24h Change</span>
                    <span className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {formatPercent(token.priceChange24h)}
                    </span>
                </div>
            </div>
        </div>
    );
};
