// components/AthleteComponents.tsx
import { useState } from 'react';

interface StatsFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  profile: any;
}

export function StatsForm({ onSubmit, onClose, profile }: StatsFormProps) {
  const [formData, setFormData] = useState({
    sport: 'FOOTBALL',
    gameDate: '',
    opponent: '',
    week: '',
    season: new Date().getFullYear().toString(),
    isHome: true,
    gameResult: '',
    mediaLink: '',
    
    // Football stats
    passCompletions: '',
    passAttempts: '',
    passYards: '',
    passTDs: '',
    interceptions: '',
    
    rushCarries: '',
    rushYards: '',
    rushTDs: '',
    rushLong: '',
    
    receptions: '',
    recYards: '',
    recTDs: '',
    recLong: '',
    
    tackles: '',
    sacks: '',
    tacklesForLoss: '',
    defensiveINTs: '',
    passBreakups: '',
    fumbleRecoveries: ''
  });

  const [activeSection, setActiveSection] = useState('game-info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare metrics object
    const metrics: any = {};
    
    // Only include non-empty numeric values
    Object.keys(formData).forEach(key => {
      if (!['sport', 'gameDate', 'opponent', 'week', 'season', 'isHome', 'gameResult', 'mediaLink'].includes(key)) {
        const value = formData[key as keyof typeof formData];
        if (value && value !== '') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue)) {
            metrics[key] = numValue;
          }
        }
      }
    });

    onSubmit({
      sport: formData.sport,
      gameDate: formData.gameDate,
      opponent: formData.opponent,
      week: formData.week,
      season: formData.season,
      isHome: formData.isHome,
      gameResult: formData.gameResult,
      mediaLink: formData.mediaLink,
      metrics
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Enter Game Stats</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {[
              { id: 'game-info', label: 'Game Info' },
              { id: 'offense', label: 'Offense' },
              { id: 'defense', label: 'Defense' }
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game Information */}
            {activeSection === 'game-info' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Game Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Game Date</label>
                    <input
                      type="date"
                      value={formData.gameDate}
                      onChange={(e) => updateField('gameDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Opponent</label>
                    <input
                      type="text"
                      value={formData.opponent}
                      onChange={(e) => updateField('opponent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Rival High School"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Week</label>
                    <input
                      type="number"
                      value={formData.week}
                      onChange={(e) => updateField('week', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="1"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Home/Away</label>
                    <select
                      value={formData.isHome ? 'home' : 'away'}
                      onChange={(e) => updateField('isHome', e.target.value === 'home')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="home">Home Game</option>
                      <option value="away">Away Game</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Game Result</label>
                    <input
                      type="text"
                      value={formData.gameResult}
                      onChange={(e) => updateField('gameResult', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="W 28-14 or L 14-21"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Media Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.mediaLink}
                    onChange={(e) => updateField('mediaLink', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://hudl.com/video/... or YouTube link"
                  />
                </div>
              </div>
            )}

            {/* Offensive Stats */}
            {activeSection === 'offense' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800">Offensive Stats</h4>
                
                {/* Passing */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-3">Passing</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Completions</label>
                      <input
                        type="number"
                        value={formData.passCompletions}
                        onChange={(e) => updateField('passCompletions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Attempts</label>
                      <input
                        type="number"
                        value={formData.passAttempts}
                        onChange={(e) => updateField('passAttempts', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Yards</label>
                      <input
                        type="number"
                        value={formData.passYards}
                        onChange={(e) => updateField('passYards', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">TDs</label>
                      <input
                        type="number"
                        value={formData.passTDs}
                        onChange={(e) => updateField('passTDs', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">INTs</label>
                      <input
                        type="number"
                        value={formData.interceptions}
                        onChange={(e) => updateField('interceptions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Rushing */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-3">Rushing</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Carries</label>
                      <input
                        type="number"
                        value={formData.rushCarries}
                        onChange={(e) => updateField('rushCarries', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Yards</label>
                      <input
                        type="number"
                        value={formData.rushYards}
                        onChange={(e) => updateField('rushYards', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">TDs</label>
                      <input
                        type="number"
                        value={formData.rushTDs}
                        onChange={(e) => updateField('rushTDs', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Long</label>
                      <input
                        type="number"
                        value={formData.rushLong}
                        onChange={(e) => updateField('rushLong', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Receiving */}
                <div>
                  <h5 className="text-md font-medium text-gray-700 mb-3">Receiving</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Receptions</label>
                      <input
                        type="number"
                        value={formData.receptions}
                        onChange={(e) => updateField('receptions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Yards</label>
                      <input
                        type="number"
                        value={formData.recYards}
                        onChange={(e) => updateField('recYards', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">TDs</label>
                      <input
                        type="number"
                        value={formData.recTDs}
                        onChange={(e) => updateField('recTDs', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Long</label>
                      <input
                        type="number"
                        value={formData.recLong}
                        onChange={(e) => updateField('recLong', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Defensive Stats */}
            {activeSection === 'defense' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800">Defensive Stats</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Total Tackles</label>
                    <input
                      type="number"
                      value={formData.tackles}
                      onChange={(e) => updateField('tackles', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Sacks</label>
                    <input
                      type="number"
                      value={formData.sacks}
                      onChange={(e) => updateField('sacks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="0"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Tackles for Loss</label>
                    <input
                      type="number"
                      value={formData.tacklesForLoss}
                      onChange={(e) => updateField('tacklesForLoss', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Interceptions</label>
                    <input
                      type="number"
                      value={formData.defensiveINTs}
                      onChange={(e) => updateField('defensiveINTs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Pass Breakups</label>
                    <input
                      type="number"
                      value={formData.passBreakups}
                      onChange={(e) => updateField('passBreakups', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Fumble Recoveries</label>
                    <input
                      type="number"
                      value={formData.fumbleRecoveries}
                      onChange={(e) => updateField('fumbleRecoveries', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="text-sm text-gray-600">
                Fill in only the stats that apply to your position and performance
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Submit Game Stats
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Stats Table Component
export function StatsTable({ stats }: { stats: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/20">
          <tr>
            <th className="p-3 text-left text-white text-sm font-medium">Date</th>
            <th className="p-3 text-left text-white text-sm font-medium">Opponent</th>
            <th className="p-3 text-left text-white text-sm font-medium">Result</th>
            <th className="p-3 text-left text-white text-sm font-medium">Key Stats</th>
            <th className="p-3 text-left text-white text-sm font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((game) => {
            const metrics = typeof game.metrics === 'string' ? JSON.parse(game.metrics) : game.metrics;
            return (
              <tr key={game.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3 text-white">
                  {new Date(game.gameDate).toLocaleDateString()}
                </td>
                <td className="p-3 text-white">{game.opponent}</td>
                <td className="p-3 text-white text-sm">
                  {game.gameResult || 'Pending'}
                </td>
                <td className="p-3 text-white text-sm">
                  <div className="space-y-1">
                    {metrics?.passYards && <div>{metrics.passYards} Pass Yds</div>}
                    {metrics?.rushYards && <div>{metrics.rushYards} Rush Yds</div>}
                    {metrics?.tackles && <div>{metrics.tackles} Tackles</div>}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    game.verified 
                      ? 'bg-green-500/20 text-green-200' 
                      : 'bg-yellow-500/20 text-yellow-200'
                  }`}>
                    {game.verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Profile Edit Form Component  
interface ProfileEditFormProps {
  profile: any;
  onSave: (profile: any) => void;
  onCancel: () => void;
}

export function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    graduationYear: profile?.graduationYear || '',
    position: profile?.position || '',
    jerseyNumber: profile?.jerseyNumber || '',
    height: profile?.height || '',
    weight: profile?.weight || '',
    gpa: profile?.gpa || '',
    bio: profile?.bio || ''
  });

  const footballPositions = [
    'QB', 'RB', 'WR', 'TE', 'OL', 'C', 'G', 'T',
    'DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'S', 'K', 'P'
  ];

  const graduationYears = ['2025', '2026', '2027', '2028', '2029'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white text-sm font-medium mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            placeholder="First name"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            placeholder="Last name"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Position</label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
          >
            <option value="" className="text-black">Select Position</option>
            {footballPositions.map(pos => (
              <option key={pos} value={pos} className="text-black">{pos}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Graduation Year</label>
          <select
            value={formData.graduationYear}
            onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
          >
            <option value="" className="text-black">Select Year</option>
            {graduationYears.map(year => (
              <option key={year} value={year} className="text-black">{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Jersey Number</label>
          <input
            type="number"
            value={formData.jerseyNumber}
            onChange={(e) => setFormData({...formData, jerseyNumber: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            placeholder="00"
            min="0"
            max="99"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Height</label>
          <input
            type="text"
            value={formData.height}
            onChange={(e) => setFormData({...formData, height: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            placeholder="6'2&quot;"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">Weight</label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            placeholder="185 lbs"
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">GPA</label>
          <input
            type="number"
            step="0.01"
            value={formData.gpa}
            onChange={(e) => setFormData({...formData, gpa: e.target.value})}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
            placeholder="3.75"
            min="0"
            max="4.0"
          />
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows={4}
          className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
          placeholder="Tell us about yourself, your goals, achievements..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ProfileDisplay({ profile }: { profile: any }) {
  if (!profile) return <div className="text-white">Loading profile...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/60 text-sm font-medium mb-1">Name</label>
          <p className="text-white text-lg">{profile.firstName} {profile.lastName}</p>
        </div>
        <div>
          <label className="block text-white/60 text-sm font-medium mb-1">School</label>
          <p className="text-white text-lg">{profile.school?.name || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-white/60 text-sm font-medium mb-1">Position</label>
          <p className="text-white text-lg">{profile.position || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-white/60 text-sm font-medium mb-1">Graduation Year</label>
          <p className="text-white text-lg">{profile.graduationYear || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-white/60 text-sm font-medium mb-1">Jersey #</label>
          <p className="text-white text-lg">{profile.jerseyNumber || 'Not set'}</p>
        </div>
        <div>
          <label className="block text-white/60 text-sm font-medium mb-1">Height/Weight</label>
          <p className="text-white text-lg">{profile.height || 'Not set'} / {profile.weight || 'Not set'}</p>
        </div>
      </div>
      
      <div>
        <label className="block text-white/60 text-sm font-medium mb-1">Bio</label>
        <p className="text-white">{profile.bio || 'No bio added yet'}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${profile.verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
        <span className="text-white text-sm">
          {profile.verified ? 'Verified Athlete' : 'Pending Verification'}
        </span>
      </div>
    </div>
  );
}