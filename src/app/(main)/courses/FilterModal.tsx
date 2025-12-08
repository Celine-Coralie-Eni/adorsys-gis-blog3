"use client";
import "@blog/i18n/boot";

import { useState, useEffect } from "react";
import { X, Filter } from "react-feather";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface FilterModalProps {
    domains: string[];
    authors: string[];
    tags: string[];
    selectedDomains: string[];
    selectedAuthors: string[];
    selectedTags: string[];
    onApply: (domains: string[], authors: string[], tags: string[]) => void;
    filteredBlogsCount: number;
}

type Tab = "domain" | "author" | "tag";

export function FilterModal({
    domains,
    authors,
    tags,
    selectedDomains,
    selectedAuthors,
    selectedTags,
    onApply,
    filteredBlogsCount,
}: FilterModalProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("domain");

    const [tempDomains, setTempDomains] = useState<string[]>(selectedDomains);
    const [tempAuthors, setTempAuthors] = useState<string[]>(selectedAuthors);
    const [tempTags, setTempTags] = useState<string[]>(selectedTags);

    // Sync temp state when modal opens or props change
    useEffect(() => {
        if (isOpen) {
            setTempDomains(selectedDomains);
            setTempAuthors(selectedAuthors);
            setTempTags(selectedTags);
        }
    }, [isOpen, selectedDomains, selectedAuthors, selectedTags]);

    const toggleSelection = (item: string, type: Tab) => {
        if (type === "domain") {
            setTempDomains((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
            );
        } else if (type === "author") {
            setTempAuthors((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
            );
        } else {
            setTempTags((prev) =>
                prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
            );
        }
    };

    const handleApply = () => {
        onApply(tempDomains, tempAuthors, tempTags);
        setIsOpen(false);
    };

    const clearAll = () => {
        setTempDomains([]);
        setTempAuthors([]);
        setTempTags([]);
        // Apply the cleared filters and close modal immediately
        onApply([], [], []);
        setIsOpen(false);
    };

    const handleQuickClear = () => {
        // Clear all filters and close modal
        onApply([], [], []);
    };

    const totalFilters = tempDomains.length + tempAuthors.length + tempTags.length;
    const activeFiltersCount = selectedDomains.length + selectedAuthors.length + selectedTags.length;
    const hasActiveFilters = activeFiltersCount > 0;

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`px-4 py-2 rounded-full backdrop-blur-xl border text-sm hover:bg-white/20 transition-all flex flex-row items-center gap-2 whitespace-nowrap ${hasActiveFilters
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/10 border-white/20 text-white'
                        }`}
                >
                    <Filter size={16} />
                    {t("search.filter")}
                    {hasActiveFilters && (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {filteredBlogsCount}
                        </span>
                    )}
                </button>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleQuickClear}
                        className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                        aria-label="Clear all filters"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[80vh] pointer-events-auto"
                        >
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">{t("search.filters")}</h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-6 border-b border-white/10">
                                    {(["domain", "author", "tag"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`
                        pb-3 text-sm font-medium transition-colors relative
                        ${activeTab === tab
                                                    ? "text-white"
                                                    : "text-gray-400 hover:text-gray-200"
                                                }
                      `}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                                            {tab === "domain" && tempDomains.length > 0 && (
                                                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{tempDomains.length}</span>
                                            )}
                                            {tab === "author" && tempAuthors.length > 0 && (
                                                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{tempAuthors.length}</span>
                                            )}
                                            {tab === "tag" && tempTags.length > 0 && (
                                                <span className="ml-2 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{tempTags.length}</span>
                                            )}
                                            {activeTab === tab && (
                                                <motion.div
                                                    layoutId="activeTab"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="flex flex-wrap gap-3">
                                    {activeTab === "domain" &&
                                        domains.map((item) => (
                                            <FilterButton
                                                key={item}
                                                label={item}
                                                isSelected={tempDomains.includes(item)}
                                                onClick={() => toggleSelection(item, "domain")}
                                            />
                                        ))}
                                    {activeTab === "author" &&
                                        authors.map((item) => (
                                            <FilterButton
                                                key={item}
                                                label={item}
                                                isSelected={tempAuthors.includes(item)}
                                                onClick={() => toggleSelection(item, "author")}
                                            />
                                        ))}
                                    {activeTab === "tag" &&
                                        tags.map((item) => (
                                            <FilterButton
                                                key={item}
                                                label={item}
                                                isSelected={tempTags.includes(item)}
                                                onClick={() => toggleSelection(item, "tag")}
                                            />
                                        ))}
                                </div>
                            </div>

                            <div className="p-6 pt-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={clearAll}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {t("search.clearAll")} ({totalFilters})
                                    </button>
                                    <button
                                        onClick={handleApply}
                                        className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        {t("search.apply")}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function FilterButton({
    label,
    isSelected,
    onClick,
}: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
        px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
        border
        ${isSelected
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                }
      `}
        >
            {label}
        </button>
    );
}
