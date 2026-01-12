"use client";

import { useEffect, useState } from "react";
import { UnifiedToken, sortTokens, FetchOptions } from "@repo/common";
import { TokenList } from "./TokenList";
import { WS_SERVER_URL } from "./utils";

export const RealTimeTokenList = ({ initialTokens, fetchOptions }: { initialTokens: UnifiedToken[], fetchOptions: FetchOptions }) => {
    // Sort initial tokens immediately
    const [tokens, setTokens] = useState<UnifiedToken[]>(initialTokens);

  
    const sortedTokens = sortTokens(tokens, fetchOptions);

    useEffect(() => {
        const ws = new WebSocket(`${WS_SERVER_URL}`);

        ws.onopen = () => {
            console.log("Connected to WebSocket");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    // We just set the raw data here. The sorting happens in the render or derived variable.
                    setTokens(data);
                }
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => {
            ws.close();
        };
    }, []);

    return <TokenList tokens={sortedTokens} />;
};
