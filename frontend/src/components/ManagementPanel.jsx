import { useMemo, useState } from 'react';
import apiClient from '../services/apiClient';
import Modal from './Modal';

const emptyBuilding = {
  name: '',
  category: 'academic',
  description: '',
  nearestNode: '',
  aliases: '',
  image: '',
  floors: 1,
};

const emptyNode = {
  nodeId: '',
  x: '',
  y: '',
  label: '',
};

export default function ManagementPanel({ buildings, nodes, onRefresh }) {
  const [activeTab, setActiveTab] = useState('buildings');
  const [buildingForm, setBuildingForm] = useState(emptyBuilding);
  const [nodeForm, setNodeForm] = useState(emptyNode);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);

  const buildingOptions = useMemo(() => buildings.map((building) => ({ value: building._id, label: building.name })), [buildings]);
  const nodeOptions = useMemo(() => nodes.map((node) => ({ value: node._id, label: node.nodeId })), [nodes]);

  async function submitBuilding(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        ...buildingForm,
        aliases: buildingForm.aliases.split(',').map((alias) => alias.trim()).filter(Boolean),
        floors: Number(buildingForm.floors),
      };
      await apiClient.post('/buildings', payload);
      setMessage('Building created successfully.');
      setBuildingForm(emptyBuilding);
      onRefresh();
    } catch (err) {
      setError(err?.message || 'Unable to create building.');
    } finally {
      setLoading(false);
    }
  }

  async function updateBuilding(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        ...buildingForm,
        aliases: buildingForm.aliases.split(',').map((alias) => alias.trim()).filter(Boolean),
        floors: Number(buildingForm.floors),
      };
      await apiClient.put(`/buildings/${buildingForm._id}`, payload);
      setMessage('Building updated successfully.');
      setBuildingForm(emptyBuilding);
      onRefresh();
    } catch (err) {
      setError(err?.message || 'Unable to update building.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteBuilding(id) {
    if (!window.confirm('Delete this building?')) return;
    setError('');
    setMessage('');
    try {
      await apiClient.delete(`/buildings/${id}`);
      setMessage('Building deleted.');
      onRefresh();
    } catch (err) {
      setError(err?.message || 'Unable to delete building.');
    }
  }

  async function submitNode(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        ...nodeForm,
        x: Number(nodeForm.x),
        y: Number(nodeForm.y),
      };
      await apiClient.post('/navigation/nodes', payload);
      setMessage('Node created successfully.');
      setNodeForm(emptyNode);
      onRefresh();
    } catch (err) {
      setError(err?.message || 'Unable to create node.');
    } finally {
      setLoading(false);
    }
  }

  async function updateNode(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        ...nodeForm,
        x: Number(nodeForm.x),
        y: Number(nodeForm.y),
      };
      await apiClient.put(`/navigation/nodes/${nodeForm._id}`, payload);
      setMessage('Node updated successfully.');
      setNodeForm(emptyNode);
      onRefresh();
    } catch (err) {
      setError(err?.message || 'Unable to update node.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteNode(id) {
    if (!window.confirm('Delete this node?')) return;
    setError('');
    setMessage('');
    try {
      await apiClient.delete(`/navigation/nodes/${id}`);
      setMessage('Node deleted.');
      onRefresh();
    } catch (err) {
      setError(err?.message || 'Unable to delete node.');
    }
  }

  return (
    <div className="glass p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`rounded-full px-3 py-2 text-sm font-semibold ${activeTab === 'buildings' ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300'}`} onClick={() => setActiveTab('buildings')}>Buildings</button>
          <button type="button" className={`rounded-full px-3 py-2 text-sm font-semibold ${activeTab === 'nodes' ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-300'}`} onClick={() => setActiveTab('nodes')}>Nodes</button>
        </div>
        {activeTab === 'buildings' ? (
          <button type="button" className="btn-primary px-3 py-2" onClick={() => { setBuildingForm(emptyBuilding); setBuildingModalOpen(true); }}>Add Building</button>
        ) : (
          <button type="button" className="btn-primary px-3 py-2" onClick={() => { setNodeForm(emptyNode); setNodeModalOpen(true); }}>Add Node</button>
        )}
      </div>

      {message && <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</div>}
      {error && <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</div>}

      {activeTab === 'buildings' ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Existing buildings</h3>
            {buildingOptions.length === 0 ? <p className="text-sm text-slate-500">No buildings yet.</p> : buildingOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm text-slate-200">{option.label}</span>
                <div className="flex gap-2">
                  <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => {
                    const building = buildings.find((item) => item._id === option.value);
                    if (building) {
                      setBuildingForm({ ...emptyBuilding, ...building, aliases: (building.aliases || []).join(', ') });
                      setBuildingModalOpen(true);
                    }
                  }}>Edit</button>
                  <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => deleteBuilding(option.value)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Existing nodes</h3>
            {nodeOptions.length === 0 ? <p className="text-sm text-slate-500">No nodes yet.</p> : nodeOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm text-slate-200">{option.label}</span>
                <div className="flex gap-2">
                  <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => {
                    const node = nodes.find((item) => item._id === option.value);
                    if (node) {
                      setNodeForm({ ...emptyNode, ...node });
                      setNodeModalOpen(true);
                    }
                  }}>Edit</button>
                  <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => deleteNode(option.value)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={buildingModalOpen} title={buildingForm._id ? 'Edit building' : 'Add building'} onClose={() => { setBuildingModalOpen(false); setBuildingForm(emptyBuilding); }}>
        <form className="space-y-3" onSubmit={buildingForm._id ? updateBuilding : submitBuilding}>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="field-label">Name</label>
              <input className="input" value={buildingForm.name} onChange={(event) => setBuildingForm({ ...buildingForm, name: event.target.value })} required />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="input" value={buildingForm.category} onChange={(event) => setBuildingForm({ ...buildingForm, category: event.target.value })}>
                {['academic','administrative','residential','amenity','landmark','sports','parking'].map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Nearest Node</label>
              <input className="input" value={buildingForm.nearestNode} onChange={(event) => setBuildingForm({ ...buildingForm, nearestNode: event.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="field-label">Floors</label>
              <input type="number" min="1" className="input" value={buildingForm.floors} onChange={(event) => setBuildingForm({ ...buildingForm, floors: event.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="field-label">Aliases</label>
              <input className="input" value={buildingForm.aliases} onChange={(event) => setBuildingForm({ ...buildingForm, aliases: event.target.value })} placeholder="Comma separated aliases" />
            </div>
            <div className="md:col-span-2">
              <label className="field-label">Description</label>
              <textarea className="input min-h-24" value={buildingForm.description} onChange={(event) => setBuildingForm({ ...buildingForm, description: event.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="field-label">Image URL</label>
              <input className="input" value={buildingForm.image} onChange={(event) => setBuildingForm({ ...buildingForm, image: event.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => { setBuildingModalOpen(false); setBuildingForm(emptyBuilding); }}>Cancel</button>
            <button type="submit" className="btn-primary px-3 py-2" disabled={loading}>{buildingForm._id ? 'Update building' : 'Create building'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={nodeModalOpen} title={nodeForm._id ? 'Edit node' : 'Add node'} onClose={() => { setNodeModalOpen(false); setNodeForm(emptyNode); }}>
        <form className="space-y-3" onSubmit={nodeForm._id ? updateNode : submitNode}>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="field-label">Node ID</label>
              <input className="input" value={nodeForm.nodeId} onChange={(event) => setNodeForm({ ...nodeForm, nodeId: event.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="field-label">Label</label>
              <input className="input" value={nodeForm.label} onChange={(event) => setNodeForm({ ...nodeForm, label: event.target.value })} />
            </div>
            <div>
              <label className="field-label">X</label>
              <input type="number" className="input" value={nodeForm.x} onChange={(event) => setNodeForm({ ...nodeForm, x: event.target.value })} required />
            </div>
            <div>
              <label className="field-label">Y</label>
              <input type="number" className="input" value={nodeForm.y} onChange={(event) => setNodeForm({ ...nodeForm, y: event.target.value })} required />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost px-3 py-2" onClick={() => { setNodeModalOpen(false); setNodeForm(emptyNode); }}>Cancel</button>
            <button type="submit" className="btn-primary px-3 py-2" disabled={loading}>{nodeForm._id ? 'Update node' : 'Create node'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
