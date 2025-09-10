import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  User,
  Trophy,
  BarChart3,
  Eye,
  Edit,
  Plus,
  Calendar,
  Wallet,
  Image,
  CheckCircle
} from 'lucide-react';

interface AthleteProfile {
  id: string;
  firstName: string;
  lastName: string;
  graduationYear?: number;
  position?: string;
  jerseyNumber?: number;
  height?: string;
  weight?: string;
  gpa?: number;
  school?: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
  team?: {
    id: string;
    name: string;
    sport: string;
  };
  bio?: string;
  avatar?: string;
  public: boolean;
  verified: boolean;
}

interface GameStat {
  id: string;
  sport: string;
  gameDate: string;
  opponent: string;
  week?: number;
  season: string;
  isHome: boolean;
  gameResult?: string;
  metrics: any;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: {
    id: string;
    email: string;
  };
  mediaLink?: string;
}

// Stats Form Component
function StatsForm({
  onSubmit,
  onClose,
  profile
}: {
  onSubmit: (data: any) => void;
  onClose: () => void;
  profile: AthleteProfile | null;
}) {
  const [formData, setFormData] = useState({
    sport: 'FOOTBALL',
    gameDate: '',
    opponent: '',
    week: '',
    season: new Date().getFullYear().toString(),
    isHome: true,
    gameResult: '',
    mediaLink: '',
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
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gameDate || !formData.opponent) {
      setError('Game date and opponent are required.');
      return;
    }

    const metrics: any = {};
    Object.keys(formData).forEach(key => {
      if (
        ![
          'sport',
          'gameDate',
          'opponent',
          'week',
          'season',
          'isHome',
          'gameResult',
          'mediaLink'
        ].includes(key)
      ) {
        const value = formData[key as keyof typeof formData];
        if (value && value !== '') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue)) {
            metrics[key] = numValue;
          }
        }
      }
    });

    setError('');
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

          {error && (
            <div className="mb-4 text-red-600 bg-red-100 rounded p-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>
            )}
            {activeSection === 'offense' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800">Offensive Stats</h4>
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

function StatsTable({ stats }: { stats: GameStat[] }) {
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
            let metrics: any = {};
            try {
              metrics =
                typeof game.metrics === 'string'
                  ? JSON.parse(game.metrics)
                  : game.metrics || {};
            } catch {
              metrics = {};
            }
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

function ProfileEditForm({
  profile,
  onSave,
  onCancel
}: {
  profile: AthleteProfile | null;
  onSave: (data: Partial<AthleteProfile>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    graduationYear: profile?.graduationYear ? profile.graduationYear.toString() : '',
    position: profile?.position || '',
    jerseyNumber: profile?.jerseyNumber ? profile.jerseyNumber.toString() : '',
    height: profile?.height || '',
    weight: profile?.weight || '',
    gpa: profile?.gpa ? profile.gpa.toString() : '',
    bio: profile?.bio || ''
  });

  const footballPositions = [
    'QB', 'RB', 'WR', 'TE', 'OL', 'C', 'G', 'T',
    'DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'S', 'K', 'P'
  ];

  const graduationYears = ['2025', '2026', '2027', '2028', '2029'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
      position: formData.position,
      jerseyNumber: formData.jerseyNumber ? Number(formData.jerseyNumber) : undefined,
      height: formData.height,
      weight: formData.weight,
      gpa: formData.gpa ? Number(formData.gpa) : undefined,
      bio: formData.bio
    });
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
            placeholder={"6'2\""}
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
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ProfileDisplay({ profile }: { profile: AthleteProfile | null }) {
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

// Main Dashboard Component
export default function AthleteEnhancedDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [stats, setStats] = useState<GameStat[]>([]);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'ATHLETE') {
      router.push('/auth/signin');
      return;
    }
    loadAthleteData();
    // eslint-disable-next-line
  }, [session, status]);

  const loadAthleteData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, statsRes, tokenRes] = await Promise.all([
        fetch('/api/athlete/profile'),
        fetch('/api/athlete/stats'),
        fetch('/api/athlete/tokens')
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        setTokenBalance(tokenData.balance || 0);
      }
    } catch (error) {
      setError('Failed to load athlete data. Please try again later.');
      console.error('Failed to load athlete data:', error);
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (updatedProfile: Partial<AthleteProfile>) => {
    setError('');
    try {
      const response = await fetch('/api/athlete/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setEditingProfile(false);
      } else {
        setError('Profile update failed.');
      }
    } catch (error) {
      setError('Profile update failed.');
      console.error('Profile update failed:', error);
    }
  };

  const handleStatsSubmission = async (statsData: any) => {
    setError('');
    try {
      const response = await fetch('/api/athlete/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsData)
      });
      if (response.ok) {
        loadAthleteData();
        setShowStatsForm(false);
      } else {
        setError('Stats submission failed.');
      }
    } catch (error) {
      setError('Stats submission failed.');
      console.error('Stats submission failed:', error);
    }
  };

  const calculateSeasonTotals = (stats: GameStat[]) => {
    const totals: Record<string, number> = {};
    stats.forEach(game => {
      let metrics: any = {};
      try {
        metrics =
          typeof game.metrics === 'string'
            ? JSON.parse(game.metrics)
            : game.metrics || {};
      } catch {
        metrics = {};
      }
      if (metrics && typeof metrics === 'object') {
        Object.keys(metrics).forEach(key => {
          const value = metrics[key];
          if (typeof value === 'number') {
            totals[key] = (totals[key] || 0) + value;
          }
        });
      }
    });
    return totals;
  };

  const seasonTotals = calculateSeasonTotals(stats);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'Athlete';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-blue-700 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 rounded p-2 text-sm">
            {error}
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {fullName}!
                </h1>
                <p className="text-white/80">
                  {profile?.position} • {profile?.school?.name} • Class of {profile?.graduationYear}
                </p>
                {profile?.team && (
                  <p className="text-white/60 text-sm">{profile.team.name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/profile/${profile?.id}`)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
              </button>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profile', label: 'Edit Profile', icon: User },
              { id: 'stats', label: 'Game Stats', icon: Trophy },
              { id: 'posters', label: 'Posters', icon: Image },
              { id: 'wallet', label: 'Wallet', icon: Wallet }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Games Recorded</p>
                    <p className="text-white text-2xl font-bold">{stats.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-white/60" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Verified Stats</p>
                    <p className="text-white text-2xl font-bold">
                      {stats.filter(s => s.verified).length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Token Balance</p>
                    <p className="text-white text-2xl font-bold">{tokenBalance}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Profile Status</p>
                    <p className="text-white text-lg font-bold">
                      {profile?.verified ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full ${profile?.verified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Recent Games</h3>
                <button
                  onClick={() => setActiveTab('stats')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm"
                >
                  View All Stats
                </button>
              </div>
              {stats.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No game stats recorded yet</p>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Submit Your First Game Stats
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.slice(0, 3).map(game => {
                    let metrics: any = {};
                    try {
                      metrics =
                        typeof game.metrics === 'string'
                          ? JSON.parse(game.metrics)
                          : game.metrics || {};
                    } catch {
                      metrics = {};
                    }
                    return (
                      <div key={game.id} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="text-white font-medium">
                              {game.week ? `Week ${game.week}` : new Date(game.gameDate).toLocaleDateString()} vs {game.opponent}
                            </p>
                            {game.verified && (
                              <span className="bg-green-500/20 text-green-200 px-2 py-1 rounded text-xs">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{game.gameResult || 'Result pending'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm">
                            {metrics?.passYards ? `${metrics.passYards} Pass Yds` :
                              metrics?.rushYards ? `${metrics.rushYards} Rush Yds` :
                                metrics?.tackles ? `${metrics.tackles} Tackles` : 'Stats recorded'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-lg font-semibold">Edit Profile</h3>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editingProfile
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Edit className="w-4 h-4 inline mr-2" />
                {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
            {editingProfile ? (
              <ProfileEditForm
                profile={profile}
                onSave={handleProfileUpdate}
                onCancel={() => setEditingProfile(false)}
              />
            ) : (
              <ProfileDisplay profile={profile} />
            )}
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowStatsForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Enter Game Stats
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Game Stats</h3>
              {stats.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">No stats entered yet</p>
                  <button
                    onClick={() => setShowStatsForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Enter Your First Game
                  </button>
                </div>
              ) : (
                <StatsTable stats={stats} />
              )}
            </div>
            {showStatsForm && (
              <StatsForm
                onSubmit={handleStatsSubmission}
                onClose={() => setShowStatsForm(false)}
                profile={profile}
              />
            )}
          </div>
        )}
        {activeTab === 'posters' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="text-center py-8">
              <Image className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-4">AI Poster generation coming soon</p>
              <p className="text-white/40 text-sm">Create custom player posters with your stats and achievements</p>
            </div>
          </div>
        )}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-lg font-semibold">My Wallet</h3>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Token Balance</p>
                  <p className="text-white text-3xl font-bold">{tokenBalance}</p>
                </div>
              </div>
              <div className="flex gap-4 mb-6">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Purchase Tokens
                </button>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">Recent Transactions</h4>
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-white text-sm">Welcome Bonus</p>
                      <p className="text-white/60 text-xs">Account creation</p>
                    </div>
                    <p className="text-green-400 font-medium">+{tokenBalance} tokens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}