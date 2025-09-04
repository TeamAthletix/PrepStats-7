import React, { useState } from 'react';

const PosterModal: React.FC<{ onClose: () => void; userId: number }> = ({ onClose, userId }) => {
  const [formData, setFormData] = useState({
    playerName: '',
    team: '',
    position: '',
    statLine: '',
    theme: 'standard',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePreview = async () => {
    setLoading(true);
    // Client-side mock or API call for preview
    setPreviewUrl('mock-preview.jpg');
    setLoading(false);
  };

  const submitRequest = async () => {
    const res = await fetch('/api/posters/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...formData }),
    });
    if (res.ok) {
      alert('Poster generated!');
      onClose();
    } else {
      alert('Error');
    }
  };

  return (
    <div className="modal">
      <h2>Create AI Poster</h2>
      <input name="playerName" placeholder="Player Name" onChange={handleChange} />
      <input name="team" placeholder="Team" onChange={handleChange} />
      <input name="position" placeholder="Position" onChange={handleChange} />
      <input name="statLine" placeholder="Stat Line" onChange={handleChange} />
      <select name="theme" onChange={handleChange}>
        <option value="standard">Standard</option>
        <option value="hype">Hype</option>
        <option value="legacy">Legacy</option>
        <option value="team_branded">Team Branded</option>
      </select>
      <button onClick={generatePreview} disabled={loading}>Generate Preview</button>
      {previewUrl && <img src={previewUrl} alt="Preview" style={{ width: '300px' }} />}
      <button onClick={submitRequest}>Spend Tokens & Generate</button>
      <button onClick={onClose}>Cancel</button>
      <p>Cost: tokens (Elite discount applied)</p>
    </div>
  );
};

export default PosterModal;
