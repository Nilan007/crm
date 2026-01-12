import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PartnerModal from '../components/PartnerModal';
import ConfirmationModal from '../components/ConfirmationModal';
import StateFilter from '../components/StateFilter';
import { useToast } from '../context/ToastContext';
import FileUpload from '../components/FileUpload';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [partnerToEdit, setPartnerToEdit] = useState(null);
    const [view, setView] = useState("grid"); // "grid" or "list"
    const [selectedState, setSelectedState] = useState(null);
    const [sectorFilter, setSectorFilter] = useState("All");

    // Confirm & Toast
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmCallback, setConfirmCallback] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const { addToast } = useToast();
    const showToast = (msg, type) => addToast(msg, type);

    const fetchPartners = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get("https://crm-backend-w02x.onrender.com/api/partners", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPartners(res.data);
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch partners", "error");
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleDelete = (id) => {
        setConfirmMessage("Are you sure you want to delete this partner?");
        setConfirmCallback(() => async () => {
            const token = localStorage.getItem("token");
            try {
                await axios.delete(`https://crm-backend-w02x.onrender.com/api/partners/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPartners(prev => prev.filter(p => p._id !== id));
                showToast("Partner deleted", "success");
            } catch (err) {
                console.error(err);
                showToast("Failed to delete partner", "error");
            }
            setShowConfirm(false);
        });
        setShowConfirm(true);
    };

    const openEdit = (partner) => {
        setPartnerToEdit(partner);
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e, partnerId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");
        try {
            await axios.post(`https://crm-backend-w02x.onrender.com/api/partners/${partnerId}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`
                }
            });
            fetchPartners(); // Refresh to see new file
            showToast("Capability statement uploaded", "success");
        } catch (err) {
            console.error(err);
            showToast("Upload failed", "error");
        }
    };

    const analyzePartner = async (partnerId) => {
        const token = localStorage.getItem("token");
        try {
            showToast("Analyzing capability statement...", "info");
            await axios.post(`https://crm-backend-w02x.onrender.com/api/partners/${partnerId}/analyze`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPartners(); // Refresh UI
            showToast("Analysis complete! Tags updated.", "success");
        } catch (err) {
            console.error(err);
            showToast("Analysis failed. Ensure a PDF is uploaded.", "error");
        }
    };

    // Filter partners by selected state
    // Filter partners by Sector then State
    const partnersInSector = partners.filter(p =>
        sectorFilter === "All" || p.sector === sectorFilter || (sectorFilter === 'State' && !p.sector)
    );

    const filteredPartners = partnersInSector.filter(partner =>
        selectedState ?
            (selectedState === '__NO_STATE__' ? !partner.state : partner.state === selectedState)
            : true
    );

    return (
        <div className="partners-page" style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* PAGE HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#172b4d', margin: '0 0 8px 0' }}>Teaming Partners ({partners.length})</h1>
                    <p style={{ color: '#6b778c', margin: 0 }}>Manage potential teaming partners, subs, and capabilities.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* View Toggle */}
                    <div style={{ display: 'flex', border: '1px solid #dfe1e6', borderRadius: '4px', overflow: 'hidden' }}>
                        <button
                            onClick={() => setView('grid')}
                            style={{
                                padding: '8px 12px',
                                background: view === 'grid' ? '#0052cc' : 'white',
                                color: view === 'grid' ? 'white' : '#172b4d',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                            title="Grid View"
                        >
                            🗂️
                        </button>
                        <button
                            onClick={() => setView('list')}
                            style={{
                                padding: '8px 12px',
                                background: view === 'list' ? '#0052cc' : 'white',
                                color: view === 'list' ? 'white' : '#172b4d',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                borderLeft: '1px solid #dfe1e6'
                            }}
                            title="List View"
                        >
                            📋
                        </button>
                    </div>

                    <button
                        onClick={() => { setPartnerToEdit(null); setIsModalOpen(true); }}
                        style={{
                            background: '#0052cc',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        + Add Partner
                    </button>
                </div>
            </div>

            {/* Active Filter Indicator */}
            {selectedState && (
                <div style={{
                    background: '#e6f2ff',
                    border: '1px solid #0052cc',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#0052cc', fontWeight: '600' }}>
                        📍 Filtered by: {selectedState === '__NO_STATE__' ? 'No Location' : selectedState}
                        <span style={{ marginLeft: '8px', color: '#42526e', fontWeight: 'normal' }}>
                            ({filteredPartners.length} of {partners.length} partners)
                        </span>
                    </span>
                    <button
                        onClick={() => setSelectedState(null)}
                        style={{
                            background: '#0052cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            {/* Two-column layout for partners grid and state filter */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '30px', alignItems: 'start' }}>

                {partners.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px', border: '1px dashed #dfe1e6', color: '#6b778c' }}>
                        <h3>No partners found.</h3>
                        <p>Add a new partner to build your teaming network.</p>
                    </div>
                ) : filteredPartners.length === 0 ? (
                    <div style={{ gridColumn: '1', textAlign: 'center', padding: '40px', color: '#6b778c' }}>
                        <h3>No partners match your filters used</h3>
                        <p>Try clearing the filters or search criteria.</p>
                    </div>
                ) : view === 'list' ? (
                    /* LIST VIEW */
                    <div style={{ gridColumn: '1', background: 'white', borderRadius: '8px', border: '1px solid #dfe1e6', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f4f5f7', borderBottom: '2px solid #dfe1e6' }}>
                                <tr>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5e6c84', fontSize: '0.8rem', textTransform: 'uppercase', width: '25%' }}>Partner Name</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5e6c84', fontSize: '0.8rem', textTransform: 'uppercase' }}>Type</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5e6c84', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contact</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5e6c84', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rating</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#5e6c84', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'right', color: '#5e6c84', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPartners.map((p) => {
                                    const statusColor = p.status === 'Active' ? '#e3fcef' : p.status === 'Prospective' ? '#fff0b3' : '#dfe1e6';
                                    const statusText = p.status === 'Active' ? '#006644' : p.status === 'Prospective' ? '#172b4d' : '#42526e';

                                    return (
                                        <tr key={p._id} style={{ borderBottom: '1px solid #ebecf0' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: '600', color: '#172b4d' }}>{p.name}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ background: p.type === 'Prime' ? '#deebff' : '#eae6ff', color: p.type === 'Prime' ? '#0747a6' : '#403294', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                    {p.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                                                {p.contactName || '-'}<br />
                                                <span style={{ color: '#6b778c', fontSize: '0.8rem' }}>{p.email}</span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>{p.performanceRating ? `${p.performanceRating}/100` : '-'}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ background: statusColor, color: statusText, padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                <button onClick={() => openEdit(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '8px' }} title="Edit">✏️</button>
                                                <button onClick={() => handleDelete(p._id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }} title="Delete">🗑️</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* GRID VIEW */
                    <div className="partners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {filteredPartners.map(partner => (
                            <div key={partner._id} style={{ background: 'white', borderRadius: '8px', border: '1px solid #dfe1e6', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#172b4d' }}>{partner.name}</h3>
                                        <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: partner.type === 'Prime' ? '#deebff' : '#eae6ff', color: partner.type === 'Prime' ? '#0747a6' : '#403294', fontWeight: '500', marginTop: '4px', display: 'inline-block' }}>
                                            {partner.type}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => openEdit(partner)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                                        <button onClick={() => handleDelete(partner._id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                                    </div>
                                </div>

                                {partner.website && <a href={partner.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#0052cc' }}>{partner.website}</a>}

                                <div style={{ fontSize: '0.9rem', color: '#42526e' }}>
                                    <strong>Contact:</strong> {partner.contactName} {partner.email && `(${partner.email})`}
                                </div>

                                {partner.capabilities && (
                                    <div style={{ background: '#f4f5f7', padding: '8px', borderRadius: '4px', fontSize: '0.85rem', color: '#172b4d', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {partner.capabilities}
                                    </div>
                                )}

                                {(partner.skills?.length > 0 || partner.agencies?.length > 0 || partner.naicsCodes?.length > 0) && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                                        {partner.agencies?.map(a => <span key={a} style={{ fontSize: '0.7em', padding: '2px 5px', background: '#E3FCEF', color: '#006644', borderRadius: '3px' }}>{a}</span>)}
                                        {partner.skills?.slice(0, 5).map(s => <span key={s} style={{ fontSize: '0.7em', padding: '2px 5px', background: '#DEEBFF', color: '#0747A6', borderRadius: '3px' }}>{s}</span>)}
                                        {partner.naicsCodes?.slice(0, 3).map(n => <span key={n} style={{ fontSize: '0.7em', padding: '2px 5px', background: '#eae6ff', color: '#403294', borderRadius: '3px' }}>{n}</span>)}
                                    </div>
                                )}

                                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#6b778c' }}>Rating: {partner.performanceRating || 50}/100</span>
                                        <span style={{ color: partner.status === 'Active' ? '#006644' : (partner.status === 'Vetted' ? '#0052cc' : '#FF991F'), fontWeight: 'bold' }}>
                                            {partner.status}
                                        </span>
                                    </div>

                                    <div style={{ marginTop: '10px' }}>
                                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px', color: '#6b778c' }}>Capability Statements:</label>
                                        {partner.files && partner.files.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {partner.files.map((f, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', background: '#f4f5f7', borderRadius: '4px' }}>
                                                        <a href={`https://crm-backend-w02x.onrender.com${f.url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#0052cc', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', whiteSpace: 'nowrap' }}>📄 {f.name || `Doc ${i + 1}`}</a>
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const token = localStorage.getItem("token");
                                                                    const updatedFiles = partner.files.filter((_, idx) => idx !== i);
                                                                    await axios.put(`https://crm-backend-w02x.onrender.com/api/partners/${partner._id}`,
                                                                        { files: updatedFiles },
                                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                                    );
                                                                    fetchPartners();
                                                                    showToast("File removed", "success");
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    showToast("Failed to remove file", "error");
                                                                }
                                                            }}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem' }}
                                                            title="Remove File"
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <span style={{ fontSize: '0.8rem', color: '#dfe1e6' }}>No files</span>}

                                        <div style={{ marginTop: '4px' }}>
                                            <FileUpload id={`file-${partner._id}`} onChange={(e) => handleFileUpload(e, partner._id)} label="⬆ Upload New" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #dfe1e6', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#172b4d' }}>Sector</h4>
                        <select
                            value={sectorFilter}
                            onChange={(e) => { setSectorFilter(e.target.value); setSelectedState(null); }}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dfe1e6' }}
                        >
                            <option value="All">All Sectors</option>
                            <option value="Federal">Federal</option>
                            <option value="State">State</option>
                            <option value="Commercial">Commercial</option>
                        </select>
                    </div>

                    <StateFilter
                        items={partnersInSector}
                        selectedState={selectedState}
                        onStateSelect={setSelectedState}
                        getStateFromItem={(p) => p.state}
                    />
                </div>

            </div>

            <PartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPartnerAdded={() => { fetchPartners(); showToast("Partner saved", "success"); }}
                partnerToEdit={partnerToEdit}
            />

            <ConfirmationModal
                isOpen={showConfirm}
                title="Delete Partner"
                message={confirmMessage}
                onConfirm={confirmCallback}
                onCancel={() => setShowConfirm(false)}
            />

        </div>
    );
}
