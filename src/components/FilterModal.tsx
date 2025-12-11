"use client";

import { useState } from "react";
import { X, Search } from "react-feather";
import { api } from "@blog/trpc/react";

type FilterTab = "domains" | "authors" | "tags";

interface SelectedFilters {
    domains: string[];
    authors: string[];
    tags: string[];
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialFilters: SelectedFilters;
    onApply: (filters: SelectedFilters) => void;
}

export function FilterModal({
    isOpen,
    onClose,
    initialFilters,
    onApply,
}: FilterModalProps) {
    const [activeTab, setActiveTab] = useState<FilterTab>("domains");
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(initialFilters);

    // Fetch all filter options in one call
    const { data: filterData } = api.search.filters.useQuery();

    const filters = filterData ?? { domains: [], authors: [], tags: [] };

    // Get current tab's data
    const currentOptions = filters[activeTab] || [];

    const toggleFilter = (category: FilterTab, value: string) => {
        setSelectedFilters(prev => {
            const current = prev[category];
            const isSelected = current.includes(value);

            return {
                ...prev,
                [category]: isSelected
                    ? current.filter(item => item !== value)
                    : [...current, value],
            };
        });
    };

    const clearAll = () => {
        const emptyFilters = { domains: [], authors: [], tags: [] };
        setSelectedFilters(emptyFilters);
        onApply(emptyFilters); // Apply immediately
        onClose();
    };

    const handleApply = () => {
        onApply(selectedFilters);
        onClose();
    };

    const totalSelected =
        selectedFilters.domains.length +
        selectedFilters.authors.length +
        selectedFilters.tags.length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-gray-900/40 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/20">
                    <h2 className="text-lg font-semibold text-white">Filters</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-5 bg-black/10">
                    {(["domains", "authors", "tags"] as FilterTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium capitalize transition-colors relative ${activeTab === tab
                                ? "text-primary"
                                : "text-white/60 hover:text-white/80"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Filter Options */}
                <div className="p-5 max-h-96 overflow-y-auto">
                    <div className="flex flex-wrap gap-2.5">
                        {currentOptions.length === 0 ? (
                            <div className="w-full flex flex-col items-center justify-center text-center text-white/50 py-10">
                                <Search className="w-12 h-12 mb-4" />
                                <p className="text-lg font-semibold">No matches found</p>
                                <p className="text-sm">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            currentOptions.map((option) => {
                                const isSelected = selectedFilters[activeTab].includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleFilter(activeTab, option)}
                                        className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${isSelected
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-gray-800/80 text-white/80 hover:bg-gray-700 border border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 border-t border-white/10 bg-black/40">
                    <button
                        onClick={clearAll}
                        disabled={totalSelected === 0}
                        className="text-sm text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Clear all {totalSelected > 0 && `(${totalSelected})`}
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary/20"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
