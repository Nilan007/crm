import React, { useState, useEffect } from 'react';
import api from '../axios';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload';
import './CompanyProfile.css';

export default function CompanyProfile() {
    const { addToast } = useToast();

    // --- STATE ---
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'

    // The "Committed" Profile (Matches Database)
    const [savedProfile, setSavedProfile] = useState(null);

    // The "Working" State (User types here)
    const [formData, setFormData] = useState({});

    const [activeTab, setActiveTab] = useState('view');
    const [saving, setSaving] = useState(false);

    // --- INITIAL LOAD ---
    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/company-profile');
            const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            setProfiles(data);
        } catch (err) {
            console.error(err);
            addToast("Failed to load profiles", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- NAVIGATION HANDLERS ---
    const handleCreateNew = () => {
        const newProfileDefaults = {
            legalName: '',
            samStatus: 'Not Registered',
            primaryAddress: { street: '', city: '', state: '', zip: '' },
            naicsCodes: [],
            legalAttachments: [],
            certificationAttachments: [],
            // ... other defaults initialized as undefined/empty
        };
        setSavedProfile(null); // No backend ID yet
        setFormData(newProfileDefaults);
        setActiveTab('legal');
        setViewMode('detail');
    };

    const handleEditProfile = (profile) => {
        setSavedProfile(profile);
        setFormData(JSON.parse(JSON.stringify(profile))); // Deep copy to avoid reference issues
        setActiveTab('view');
        setViewMode('detail');
    };

    const handleBackToList = () => {
        // Warn if unsaved? For now, just go back.
        setViewMode('list');
        setSavedProfile(null);
        setFormData({});
        fetchProfiles();
    };

    // --- FIELD UPDATERS ---
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    // --- SAVE LOGIC ---
    const handleSave = async () => {
        if (!formData.legalName || !formData.legalName.trim()) {
            addToast("Legal Company Name is required.", "error");
            return;
        }

        setSaving(true);
        try {
            let res;
            if (savedProfile && savedProfile._id) {
                // Update
                res = await api.put(`/api/company-profile/${savedProfile._id}`, formData);
                addToast("Changes saved successfully!", "success");
            } else {
                // Create
                res = await api.post('/api/company-profile', formData);
                addToast("New Company Profile created!", "success");
            }

            // Sync States
            setSavedProfile(res.data);
            setFormData(JSON.parse(JSON.stringify(res.data)));
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Save failed";
            const detail = err.response?.data?.error ? ` (${err.response.data.error})` : "";
            alert(`Error: ${msg}${detail}`); // Use alert for persistence, or toast
            addToast(`Error: ${msg}`, "error");
        } finally {
            setSaving(false);
        }
    };

    // --- DELETE PROFILE ---
    const handleDeleteProfile = async () => {
        if (!savedProfile?._id) return;
        if (!window.confirm("Delete this company profile permanently?")) return;

        try {
            await api.delete(`/api/company-profile/${savedProfile._id}`);
            addToast("Profile deleted.", "success");
            handleBackToList();
        } catch (err) {
            console.error(err);
            addToast("Failed to delete.", "error");
        }
    };

    // --- FILE UPLOAD LOGIC ---
    // Common handler for all file sections
    const handleGenericUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            // Upload to generic endpoint
            const res = await api.post('/api/company-profile/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Create attachment object
            const newAttachment = {
                name: res.data.name,
                url: res.data.url,
                docType: 'Document', // Matches backend AttachmentSchema
                uploadedAt: new Date()
            };

            // Add to LOCAL formData state (User must click Save to persist relation)
            setFormData(prev => ({
                ...prev,
                [fieldName]: [...(prev[fieldName] || []), newAttachment]
            }));

            addToast("File staged. Click 'Save All Changes' to confirm.", "info");
        } catch (err) {
            console.error(err);
            addToast("Upload failed.", "error");
        }
    };

    const removeAttachment = (fieldName, index) => {
        setFormData(prev => {
            const updated = [...(prev[fieldName] || [])];
            updated.splice(index, 1);
            return { ...prev, [fieldName]: updated };
        });
        addToast("Attachment removed from list. Click Save to apply.", "info");
    };


    // --- RENDER HELPERS ---
    if (loading) return <div className="profile-container">Loading...</div>;

    const tabs = [
        { id: 'view', label: 'View Profile' },
        { id: 'legal', label: 'Legal & Business' },
        { id: 'registration', label: 'Registration' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'capabilities', label: 'Capabilities' },
        { id: 'financial', label: 'Financial' },
        { id: 'compliance', label: 'Compliance' },
        { id: 'teaming', label: 'Teaming' },
        // { id: 'performance', label: 'Past Performance' },
        // { id: 'contacts', label: 'Key Contacts' },
    ];

    // *** LIST VIEW ***
    if (viewMode === 'list') {
        return (
            <div className="profile-container">
                <div className="profile-header">
                    <h1>Company Directory</h1>
                    <p>Manage your organization profiles</p>
                    <button className="btn-save-profile" onClick={handleCreateNew}>+ New Company</button>
                </div>
                <div className="profiles-grid">
                    {profiles.map(p => (
                        <div key={p._id} className="company-card" onClick={() => handleEditProfile(p)}>
                            <div className="card-header">
                                <h3 title={p.legalName}>{p.legalName || 'Untitled Company'}</h3>
                                <div className="card-actions">
                                    <span className="edit-icon">✎</span>
                                </div>
                            </div>

                            <div className="card-badges">
                                {p.businessType && <span className="badge type-badge">{p.businessType}</span>}
                                <span className={`badge status-badge ${p.samStatus === 'Active' ? 'active' : 'expired'}`}>
                                    {p.samStatus || 'Unknown'}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="detail-item">
                                    <label>UEI</label>
                                    <span>{p.uei || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>CAGE</label>
                                    <span>{p.cageCode || '-'}</span>
                                </div>
                                <div className="detail-item full">
                                    <label>Location</label>
                                    <span>
                                        {[p.primaryAddress?.city, p.primaryAddress?.state].filter(Boolean).join(', ') || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {profiles.length === 0 && (
                        <div className="empty-state">
                            <p>No company profiles found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // *** DETAIL VIEW ***
    // Use `savedProfile` for Header (Static name). Use `formData` for Inputs.
    return (
        <div className="profile-container">
            {/* HEADER */}
            <div className="profile-header">
                <div>
                    <button onClick={handleBackToList} className="back-link btn-back-directory">← Directory</button>
                    {/* Header shows COMMITTED name, not typing name */}
                    <h1>{savedProfile?.legalName || formData.legalName || 'New Company'}</h1>
                    <p>Edit Mode - Unsaved changes will be lost</p>
                </div>
                <div className="header-actions">
                    {savedProfile?._id && (
                        <button onClick={handleDeleteProfile} className="btn-delete" style={{ marginRight: '10px', background: '#e53e3e', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>
                            Delete
                        </button>
                    )}
                    <button onClick={handleSave} disabled={saving} className="btn-save-profile">
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                    <div className="save-warning" style={{ color: '#fff', fontSize: '0.8rem', marginTop: '5px', textAlign: 'right' }}>
                        * Click Save to Apply Changes
                    </div>
                </div>
            </div>

            <div className="profile-split-layout">
                {/* SIDEBAR */}
                <div className="profile-sidebar-wrapper">
                    <div className="profile-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="profile-main-content">
                    <div className="profile-content">

                        {/* 1. VIEW SUMMARY */}
                        {activeTab === 'view' && (
                            <div className="tab-panel view-mode">
                                <h2>Profile Summary</h2>
                                <div className="summary-section">
                                    <div className="detail-row"><strong>Legal Name:</strong> <span>{formData.legalName}</span></div>
                                    <div className="detail-row"><strong>UEI:</strong> <span>{formData.uei}</span></div>
                                    <div className="detail-row"><strong>CAGE:</strong> <span>{formData.cageCode}</span></div>
                                    <div className="detail-row"><strong>SAM Status:</strong> <span>{formData.samStatus}</span></div>
                                </div>
                                <div className="info-box">Select a tab on the left to edit details.</div>
                            </div>
                        )}

                        {/* 2. LEGAL & BUSINESS */}
                        {activeTab === 'legal' && (
                            <div className="tab-panel">
                                <h2>Legal & Business</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Legal Name *</label>
                                        <input type="text" value={formData.legalName || ''} onChange={e => updateField('legalName', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>DBA</label>
                                        <input type="text" value={formData.dba || ''} onChange={e => updateField('dba', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>UEI</label>
                                        <input type="text" value={formData.uei || ''} onChange={e => updateField('uei', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>CAGE Code</label>
                                        <input type="text" value={formData.cageCode || ''} onChange={e => updateField('cageCode', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Business Type</label>
                                        <select value={formData.businessType || ''} onChange={e => updateField('businessType', e.target.value)}>
                                            <option value="">Select...</option>
                                            <option value="LLC">LLC</option>
                                            <option value="Corporation">Corporation</option>
                                            <option value="S-Corp">S-Corp</option>
                                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Year Established</label>
                                        <input type="number" value={formData.yearEstablished || ''} onChange={e => updateField('yearEstablished', e.target.value)} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Website</label>
                                        <input type="url" value={formData.websiteUrl || ''} onChange={e => updateField('websiteUrl', e.target.value)} />
                                    </div>
                                </div>

                                <h3>Primary Address</h3>
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Street</label>
                                        <input type="text" value={formData.primaryAddress?.street || ''} onChange={e => updateNestedField('primaryAddress', 'street', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" value={formData.primaryAddress?.city || ''} onChange={e => updateNestedField('primaryAddress', 'city', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input type="text" value={formData.primaryAddress?.state || ''} onChange={e => updateNestedField('primaryAddress', 'state', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>ZIP</label>
                                        <input type="text" value={formData.primaryAddress?.zip || ''} onChange={e => updateNestedField('primaryAddress', 'zip', e.target.value)} />
                                    </div>
                                </div>

                                <div className="attachments-section">
                                    <h3>Legal Documents</h3>
                                    <FileUpload label="Upload Articles/Tax Docs" onChange={(e) => handleGenericUpload(e, 'legalAttachments')} />

                                    <ul className="file-list">
                                        {formData.legalAttachments?.map((file, i) => (
                                            <li key={i} className="file-item">
                                                <a href={`${import.meta.env.VITE_API_URL}${file.url}`} target="_blank" rel="noreferrer">{file.name}</a>
                                                <button type="button" onClick={() => removeAttachment('legalAttachments', i)} className="btn-remove-file">×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* 3. REGISTRATION */}
                        {activeTab === 'registration' && (
                            <div className="tab-panel">
                                <h2>Registration</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>SAM Status</label>
                                        <select value={formData.samStatus || 'Not Registered'} onChange={e => updateField('samStatus', e.target.value)}>
                                            <option value="Not Registered">Not Registered</option>
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiration Date</label>
                                        <input type="date" value={formData.samExpirationDate ? formData.samExpirationDate.split('T')[0] : ''} onChange={e => updateField('samExpirationDate', e.target.value)} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>GSA Schedule</label>
                                        <input type="text" value={formData.gsaSchedule || ''} onChange={e => updateField('gsaSchedule', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. CERTIFICATIONS */}
                        {activeTab === 'certifications' && (
                            <div className="tab-panel">
                                <h2>Certifications</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Business Size</label>
                                        <select value={formData.businessSize || ''} onChange={e => updateField('businessSize', e.target.value)}>
                                            <option value="">Select...</option>
                                            <option value="Small">Small</option>
                                            <option value="Large">Large</option>
                                        </select>
                                    </div>
                                    <div className="form-checkbox-group">
                                        <label><input type="checkbox" checked={formData.minorityOwned || false} onChange={e => updateField('minorityOwned', e.target.checked)} /> Minority Owned</label>
                                        <label><input type="checkbox" checked={formData.womanOwned || false} onChange={e => updateField('womanOwned', e.target.checked)} /> Woman Owned</label>
                                        <label><input type="checkbox" checked={formData.veteranOwned || false} onChange={e => updateField('veteranOwned', e.target.checked)} /> Veteran Owned</label>
                                    </div>
                                </div>
                                <div className="attachments-section">
                                    <h3>Certification Files</h3>
                                    <FileUpload label="Upload Certs" onChange={(e) => handleGenericUpload(e, 'certificationAttachments')} />
                                    <ul className="file-list">
                                        {formData.certificationAttachments?.map((file, i) => (
                                            <li key={i} className="file-item">
                                                <a href={`${import.meta.env.VITE_API_URL}${file.url}`} target="_blank" rel="noreferrer">{file.name}</a>
                                                <button type="button" onClick={() => removeAttachment('certificationAttachments', i)} className="btn-remove-file">×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* 5. CAPABILITIES */}
                        {activeTab === 'capabilities' && (
                            <div className="tab-panel">
                                <h2>Capabilities</h2>
                                <div className="form-group full-width">
                                    <label>Core Capabilities</label>
                                    <textarea rows="6" value={formData.coreCapabilities || ''} onChange={e => updateField('coreCapabilities', e.target.value)} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Security Capabilities</label>
                                    <textarea rows="4" value={formData.securityCapabilities || ''} onChange={e => updateField('securityCapabilities', e.target.value)} />
                                </div>
                                <div className="attachments-section">
                                    <h3>Capability Statements</h3>
                                    <FileUpload label="Upload Cap Statement" onChange={(e) => handleGenericUpload(e, 'capabilityAttachments')} />
                                    <ul className="file-list">
                                        {formData.capabilityAttachments?.map((file, i) => (
                                            <li key={i} className="file-item">
                                                <a href={`${import.meta.env.VITE_API_URL}${file.url}`} target="_blank" rel="noreferrer">{file.name}</a>
                                                <button type="button" onClick={() => removeAttachment('capabilityAttachments', i)} className="btn-remove-file">×</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* 6. FINANCIAL */}
                        {activeTab === 'financial' && (
                            <div className="tab-panel">
                                <h2>Financial</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Banking Institution</label>
                                        <input type="text" value={formData.bankingInstitution || ''} onChange={e => updateField('bankingInstitution', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Accounting System</label>
                                        <input type="text" value={formData.accountingSystem || ''} onChange={e => updateField('accountingSystem', e.target.value)} />
                                    </div>
                                    <div className="form-checkbox-group">
                                        <label><input type="checkbox" checked={formData.dcaaCompliant || false} onChange={e => updateField('dcaaCompliant', e.target.checked)} /> DCAA Compliant</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7. COMPLIANCE */}
                        {activeTab === 'compliance' && (
                            <div className="tab-panel">
                                <h2>Compliance</h2>
                                <div className="form-grid">
                                    <div className="form-checkbox-group">
                                        <label><input type="checkbox" checked={formData.hipaaCompliant || false} onChange={e => updateField('hipaaCompliant', e.target.checked)} /> HIPAA Compliant</label>
                                    </div>
                                    <div className="form-group">
                                        <label>SOC 2</label>
                                        <select value={formData.soc2 || 'None'} onChange={e => updateField('soc2', e.target.value)}>
                                            <option value="None">None</option>
                                            <option value="Type I">Type I</option>
                                            <option value="Type II">Type II</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>CMMC Level</label>
                                        <select value={formData.cmmcLevel || 'None'} onChange={e => updateField('cmmcLevel', e.target.value)}>
                                            <option value="None">None</option>
                                            <option value="Level 1">Level 1</option>
                                            <option value="Level 2">Level 2</option>
                                            <option value="Level 3">Level 3</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 8. TEAMING */}
                        {activeTab === 'teaming' && (
                            <div className="tab-panel">
                                <h2>Teaming</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Preference</label>
                                        <select value={formData.primeSubPreference || ''} onChange={e => updateField('primeSubPreference', e.target.value)}>
                                            <option value="">Select...</option>
                                            <option value="Prime">Prime</option>
                                            <option value="Subcontractor">Subcontractor</option>
                                            <option value="Both">Both</option>
                                        </select>
                                    </div>
                                    <div className="form-checkbox-group">
                                        <label><input type="checkbox" checked={formData.hasSubcontractingPlan || false} onChange={e => updateField('hasSubcontractingPlan', e.target.checked)} /> Has Subcontracting Plan</label>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
