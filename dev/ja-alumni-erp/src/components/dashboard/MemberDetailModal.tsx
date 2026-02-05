"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Save, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';

interface MemberDetailModalProps {
    member: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    currentUserRole?: string;
}

export default function MemberDetailModal({ member, isOpen, onClose, onUpdate, currentUserRole }: MemberDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(member);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen || !member) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    nom: formData.nom,
                    prenom: formData.prenom,
                    telephone: formData.telephone,
                    departement: formData.departement,
                    situation: formData.situation,
                    secteur: formData.secteur,
                    statut: formData.statut // Admin/Mod can change status
                })
                .eq('id', member.id);

            if (updateError) throw updateError;

            onUpdate(); // Refresh parent
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '0.5rem',
                width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEditing ? 'Modifier le membre' : `${member.prenom} ${member.nom}`}
                    {!isEditing && (
                        <span style={{
                            fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '1rem',
                            background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)'
                        }}>
                            {member.statut === 'membre' ? 'Alumni' :
                                member.statut === 'moderateur' ? 'Référent' :
                                    member.statut === 'admin' ? 'COPIL' : member.statut}
                        </span>
                    )}
                </h2>

                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                    {/* Basic Info */}
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#666' }}>Prénom</label>
                            {isEditing ? (
                                <input className="input" name="prenom" value={formData.prenom || ''} onChange={handleChange} />
                            ) : (
                                <div style={{ fontWeight: 500 }}>{member.prenom}</div>
                            )}
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#666' }}>Nom</label>
                            {isEditing ? (
                                <input className="input" name="nom" value={formData.nom || ''} onChange={handleChange} />
                            ) : (
                                <div style={{ fontWeight: 500 }}>{member.nom}</div>
                            )}
                        </div>
                    </div>

                    {/* Contact - Email is read only typically to avoid auth issues */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Email</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} color="#666" />
                            <span>{member.email}</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Téléphone</label>
                        {isEditing ? (
                            <input className="input" name="telephone" value={formData.telephone || ''} onChange={handleChange} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} color="#666" />
                                <span>{member.telephone || 'Non renseigné'}</span>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#666' }}>Région</label>
                            <div>{member.region}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: '#666' }}>Département</label>
                            {isEditing ? (
                                <input className="input" name="departement" value={formData.departement || ''} onChange={handleChange} />
                            ) : (
                                <div>{member.departement || '-'}</div>
                            )}
                        </div>
                    </div>

                    {/* Pro */}
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Situation</label>
                        {isEditing ? (
                            <input className="input" name="situation" value={formData.situation || ''} onChange={handleChange} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={16} color="#666" />
                                <span>{member.situation || 'Non renseigné'}</span>
                            </div>
                        )}
                    </div>

                    {/* Mini Entreprise */}
                    {/* Mini Entreprise */}
                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Mini-Entreprise</h4>
                        <div style={{ fontSize: '0.9rem' }}>
                            Annee: {member.mini_entreprise_annee || '-'} <br />
                            Nom: {member.mini_entreprise_nom || '-'}
                        </div>
                    </div>

                    {/* Role Management (COPIL+ Only) */}
                    {currentUserRole === 'superadmin' && (
                        <div style={{ padding: '1rem', border: '1px solid var(--color-primary-light)', borderRadius: '0.5rem', marginTop: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>Gestion du Rôle (COPIL+)</h4>
                            {isEditing ? (
                                <select
                                    className="input"
                                    name="statut"
                                    value={formData.statut}
                                    onChange={handleChange}
                                >
                                    <option value="membre">Alumni (Membre)</option>
                                    <option value="moderateur">Référent (Modérateur)</option>
                                    <option value="admin">COPIL (Admin)</option>
                                    <option value="superadmin">COPIL+ (SuperAdmin)</option>
                                </select>
                            ) : (
                                <div style={{ fontSize: '0.9rem' }}>
                                    Rôle actuel: <strong>{
                                        member.statut === 'superadmin' ? 'COPIL+' :
                                            member.statut === 'admin' ? 'COPIL' :
                                                member.statut === 'moderateur' ? 'Référent' : 'Alumni'
                                    }</strong>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {isEditing ? (
                        <>
                            <button className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={saving}>Annuler</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Enregistrement...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Sauvegarder</>}
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Modifier</button>
                    )}
                </div>
            </div>
        </div>
    );
}
