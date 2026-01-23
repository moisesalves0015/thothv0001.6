import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronDown, Check, Filter } from 'lucide-react';

interface FilterBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    sortBy: 'recent' | 'az';
    setSortBy: (sort: 'recent' | 'az') => void;
    totalResults: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ searchTerm, setSearchTerm, sortBy, setSortBy, totalResults }) => {
    const [filterOpen, setFilterOpen] = useState(false);

    return (
        <div className="sticky top-[80px] z-20 bg-white/80 backdrop-blur-md p-4 -mx-4 rounded-2xl border border-slate-200/50 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center transition-all">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800 px-2">Minha Rede</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                    {totalResults}
                </span>
            </div>

            <div className="flex w-full md:w-auto gap-3">
                {/* Search Input */}
                <div className="relative group flex-1 md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006c55] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, curso ou universidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="h-11 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ArrowUpDown size={16} />
                        <span className="hidden md:inline">
                            {sortBy === 'recent' ? 'Recentes' : 'A-Z'}
                        </span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {filterOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="p-1">
                                    <button
                                        onClick={() => { setSortBy('recent'); setFilterOpen(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${sortBy === 'recent' ? 'bg-[#006c55]/5 text-[#006c55]' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Mais Recentes {sortBy === 'recent' && <Check size={14} />}
                                    </button>
                                    <button
                                        onClick={() => { setSortBy('az'); setFilterOpen(false); }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${sortBy === 'az' ? 'bg-[#006c55]/5 text-[#006c55]' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Alfabética (A-Z) {sortBy === 'az' && <Check size={14} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
