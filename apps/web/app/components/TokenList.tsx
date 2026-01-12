
import { UnifiedToken } from "@repo/common";
import { TokenCard } from "./TokenCard";

export const TokenList = ({ tokens }: { tokens: UnifiedToken[] }) => {


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tokens.map((token) => (
                <TokenCard key={token.address} token={token} />
            ))}
        </div>
    );
};