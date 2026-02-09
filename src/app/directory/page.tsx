"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Avatar from '@/components/ui/Avatar';
import { Search, MapPin, Briefcase, Linkedin, Mail, LayoutGrid, Users, Award, Shield } from 'lucide-react';
import geoData from '@/lib/geoData';

const COPIL_ORDER = [
    'Présidence',
    'Vice‑présidence',
    'Trésorerie',
    'Secrétariat',
    'Coordination des régions',
    'Projets digitaux',
    'Communication',
    'Événementiel'
];

type TabType = 'alumni' | 'referent' | 'copil';

export default function DirectoryPage() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('alumni');
    const [regionFilter, setRegionFilter] = useState('all');
    const [sortOption, setSortOption] = useState<string>('default'); // 'default', 'name-asc', 'year-desc', 'year-asc'
    const { regions } = geoData;

    useEffect(() => {
        const fetchProfiles = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('last_name');

            if (error) console.error(error);
            else setProfiles(data || []);
            setLoading(false);
        };

        fetchProfiles();
    }, []);

    // Filter by Search & Region (Global)
    const filteredBySearchAndRegion = profiles.filter(profile => {
        const fullSearch = (profile.first_name + ' ' + (profile.last_name || '')).toLowerCase();
        const matchesSearch = fullSearch.includes(searchTerm.toLowerCase());
        const matchesRegion = regionFilter === 'all' || profile.region === regionFilter;
        return matchesSearch && matchesRegion;
    });

    // Partition by Tab
    let displayedProfiles = filteredBySearchAndRegion.filter(profile => {
        if (activeTab === 'copil') {
            return ['copil', 'copil_plus'].includes(profile.role);
        } else if (activeTab === 'referent') {
            return profile.role === 'referent' || profile.is_referent === true;
        } else {
            // Alumni includes EVERYONE (Alumni, Referents, Copil)
            return true;
        }
    });

    // Custom Sorting per Tab
    displayedProfiles.sort((a, b) => {
        // First priority: User selected sort
        if (sortOption === 'name-asc') {
            return (a.last_name || '').localeCompare(b.last_name || '');
        }
        if (sortOption === 'year-desc') {
            return (b.mini_ent_year || 0) - (a.mini_ent_year || 0);
        }
        if (sortOption === 'year-asc') {
            return (a.mini_ent_year || 0) - (b.mini_ent_year || 0);
        }

        // Default Sort logic (when sortOption is 'default')
        if (activeTab === 'copil') {
            // Sort by Role Order (Présidence first...)
            const roleA = a.copil_role || '';
            const roleB = b.copil_role || '';
            const indexA = COPIL_ORDER.indexOf(roleA);
            const indexB = COPIL_ORDER.indexOf(roleB);

            // If both are in the priority list
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is in list, A comes first
            if (indexA !== -1) return -1;
            // If only B, B comes first
            if (indexB !== -1) return 1;

            // Otherwise sort by role name then last name
            if (roleA !== roleB) return roleA.localeCompare(roleB);
            return (a.last_name || '').localeCompare(b.last_name || '');
        }

        if (activeTab === 'referent') {
            // Sort by Region
            if (a.region !== b.region) return (a.region || '').localeCompare(b.region || '');
            return (a.last_name || '').localeCompare(b.last_name || '');
        }

        // Alumni Default: Last Name
        return (a.last_name || '').localeCompare(b.last_name || '');
    });


    const getRoleBadge = (role: string, copilRole?: string, isReferent?: boolean, copilStartYear?: string) => {
        const referentBadge = <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">Référent</span>;

        const BadgeWrapper = ({ children }: { children: React.ReactNode }) => (
            <div className="flex flex-col items-center gap-1.5">{children}</div>
        );

        switch (role) {
            case 'copil':
            case 'copil_plus':
                return (
                    <BadgeWrapper>
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">Copil</span>
                            {copilRole && <span className="text-[10px] font-medium text-purple-600 italic leading-tight">{copilRole}</span>}
                            {copilStartYear && <span className="text-[9px] text-slate-400">Depuis {copilStartYear}</span>}
                        </div>
                        {isReferent && referentBadge}
                    </BadgeWrapper>
                );
            case 'referent': return referentBadge;
            default: return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">Alumni</span>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Réseau</h1>
                    <p className="text-slate-500 mt-1">Retrouvez tous les membres du réseau JA Alumni.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-1">
                <button
                    onClick={() => { setActiveTab('alumni'); setSortOption('default'); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'alumni' ? 'border-[var(--color-primary-600)] text-[var(--color-primary-700)]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Users size={18} />
                    Alumni
                </button>
                <button
                    onClick={() => { setActiveTab('referent'); setSortOption('default'); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'referent' ? 'border-orange-500 text-orange-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <MapPin size={18} />
                    Référents
                </button>
                <button
                    onClick={() => { setActiveTab('copil'); setSortOption('default'); }}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'copil' ? 'border-purple-500 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Award size={18} />
                    COPIL
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 sticky top-20 z-10 backdrop-blur-md bg-white/90">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <div>
                        <select
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="input w-full"
                        >
                            <option value="all">Toutes les régions</option>
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="input w-full"
                        >
                            <option value="default">Tri par défaut</option>
                            <option value="name-asc">Nom (A-Z)</option>
                            <option value="year-desc">Année Mini-Ent (Récent)</option>
                            <option value="year-asc">Année Mini-Ent (Ancien)</option>
                        </select>
                    </div>
                </div>
            </div>

            {activeTab === 'copil' && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-700">
                    Les membres du COPIL sont triés par pôle (Présidence, etc.).
                </div>
            )}
            {activeTab === 'referent' && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100 text-sm text-orange-700">
                    Les référents sont triés par région.
                </div>
            )}

            {/* Results */}
            <div className="mb-4 text-sm text-slate-500 text-right">
                <span className="font-bold text-slate-900">{displayedProfiles.length}</span> membres affichés
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary-600)] border-t-transparent rounded-full mx-auto mb-4"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedProfiles.map(profile => (
                        <div key={profile.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col group">

                            <div className={`h-20 relative bg-gradient-to-r ${activeTab === 'copil' ? 'from-purple-50 to-purple-100' :
                                activeTab === 'referent' ? 'from-orange-50 to-orange-100' :
                                    'from-slate-100 to-slate-200'
                                }`}>
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                                    <Avatar
                                        url={profile.avatar_url}
                                        firstName={profile.first_name}
                                        lastName={profile.last_name}
                                        size={80}
                                        className="border-4 border-white shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-12 px-4 pb-4 flex-1 flex flex-col items-center text-center">
                                <h3 className="font-bold text-slate-900 text-lg truncate w-full">
                                    {profile.first_name} {profile.last_name}
                                </h3>

                                <div className="mt-2 mb-4">
                                    {getRoleBadge(profile.role, profile.copil_role, profile.is_referent, profile.copil_start_year)}
                                </div>

                                <div className="w-full space-y-2 mt-auto text-sm text-slate-600">
                                    {profile.region && (
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500" title="Localisation">
                                            <MapPin size={12} />
                                            <span className="truncate max-w-[150px]">{profile.region}</span>
                                        </div>
                                    )}

                                    {profile.mini_ent_name && activeTab === 'alumni' && (
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500" title="Mini-Entreprise">
                                            <Briefcase size={12} />
                                            <span className="truncate max-w-[150px]">{profile.mini_ent_name} ({profile.mini_ent_year})</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50 w-full justify-center">
                                    {profile.linkedin_url && (
                                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5]">
                                            <Linkedin size={18} />
                                        </a>
                                    )}
                                    <a href={`mailto:${profile.email}`} className="text-slate-400 hover:text-slate-700">
                                        <Mail size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && displayedProfiles.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-500 text-lg">Aucun membre dans cette catégorie.</p>
                </div>
            )}
        </div>
    );
}
