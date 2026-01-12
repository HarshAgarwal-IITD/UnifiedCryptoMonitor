"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FetchOptions } from "@repo/common";
import { useState, useRef, useEffect } from "react";
import { ChevronIcon, FilterIcon } from "./icons";
// import { ChevronDown } from "lucide-react"; // Removed to avoid dependency

// Icons for a premium feel - assuming standard set or SVGs


interface DropdownProps {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
}

const Dropdown = ({ label, options, value, onChange }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative group" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                    ${isOpen
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface border-white/5 text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:border-white/10'
                    }
                `}
            >
                <span>{label}:</span>
                <span className="text-text-primary">{selectedOption?.label || "Select"}</span>
                <ChevronIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`
                absolute z-50 top-full mt-2 w-48 p-1.5 rounded-xl border border-white/5 
                bg-surface shadow-2xl backdrop-blur-xl transition-all duration-200 origin-top
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
            `}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`
                            flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors
                            ${option.value === value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                            }
                        `}
                    >
                        {option.label}
                        {option.value === value && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const FilterBar = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentSortBy = searchParams.get("sortBy") as FetchOptions["sortBy"];
    const currentSortOrder = searchParams.get("sortOrder") as FetchOptions["sortOrder"];
    const currentFilterPeriod = searchParams.get("filterPeriod") as FetchOptions["filterPeriod"];

    const activeFilterCount = [currentSortBy, currentSortOrder, currentFilterPeriod].filter(Boolean).length;

    const updateFilters = (updates: Partial<Record<keyof FetchOptions, string | null>>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="sticky top-0 z-40 py-4 -mx-4 px-4 bg-background/80 backdrop-blur-md border-b border-white/5 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 max-w-[1400px] mx-auto">
                <div className="flex items-center gap-2 text-text-secondary">
                    <div className="p-2 bg-surface rounded-lg border border-white/5">
                        <FilterIcon className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Dropdown
                        label="Sort By"
                        value={currentSortBy || ""}
                        onChange={(val) => updateFilters({
                            sortBy: val,
                            sortOrder: null, // Reset order
                            filterPeriod: null // Reset period
                        })}
                        options={[
                            { label: "Volume", value: "volume" },
                            { label: "Price Change", value: "priceChange" },
                            { label: "Market Cap", value: "marketCap" },
                        ]}
                    />

                    <Dropdown
                        label="Order"
                        value={currentSortOrder || ""}
                        onChange={(val) => updateFilters({
                            sortOrder: val,
                            filterPeriod: null // Reset period
                        })}
                        options={[
                            { label: "Highest First", value: "desc" },
                            { label: "Lowest First", value: "asc" },
                        ]}
                    />

                    {currentSortBy === 'priceChange' && (
                        <Dropdown
                            label="Period"
                            value={currentFilterPeriod || ""}
                            onChange={(val) => updateFilters({ filterPeriod: val })}
                            options={[
                                { label: "1 Hour", value: "1h" },
                                { label: "6 Hours", value: "6h" },
                                { label: "24 Hours", value: "24h" },
                                { label: "7 Days", value: "7d" },
                            ]}
                        />
                    )}
                </div>

                <div className="hidden md:ml-auto md:flex items-center gap-2 text-xs text-text-secondary uppercase tracking-wider font-medium">
                    <span>Active Filters:</span>
                    <span className="text-primary">{activeFilterCount}</span>
                </div>
            </div>
        </div>
    );
};

