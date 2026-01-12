import { RealTimeTokenList } from "./components/RealTimeTokenList";
import { FilterBar } from "./components/FilterBar";
import { UnifiedToken, FetchOptions } from "@repo/common";
import axios from "axios";
import { HTTP_SERVER_URL } from "./components/utils";

export const dynamic = 'force-dynamic';

async function getTokens(options: FetchOptions): Promise<UnifiedToken[]> {
  try {
    // Assuming backend is running on port 3003 locally
    const res = await axios.get(`${HTTP_SERVER_URL}discover`, {
      params: options
    });
    //console.log(res.data);
    if (!res.data) {
      console.error("Fetch error:", res.status, res.statusText);
      return [];
    }
    const data = res.data;
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Connection error:", e);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Next.js 15 searchParams is a Promise
  const resolvedParams = await searchParams;

  const fetchOptions: FetchOptions = {
    sortBy: (resolvedParams.sortBy as any),
    sortOrder: (resolvedParams.sortOrder as any),
    filterPeriod: (resolvedParams.filterPeriod as any),
  };

  const tokens = await getTokens(fetchOptions);

  return (
    <main className="min-h-screen bg-background text-text-primary p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-white/5 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-text-secondary bg-clip-text text-transparent">
              Market Discovery
            </h1>
            <p className="text-text-secondary text-base font-normal">
              Real-time trending assets aggregated from CoinGecko & Jupiter
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold border border-success/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            Live
          </div>
        </header>

        <FilterBar />

        {tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-white/5 text-center px-4">
            <h2 className="text-xl font-semibold mb-2">No data available</h2>
            <p className="text-text-secondary">Is the backend server running on port 3003?</p>
          </div>
        ) : (
          <RealTimeTokenList initialTokens={tokens} fetchOptions={fetchOptions} />
        )}
      </div>
    </main>
  );
}
