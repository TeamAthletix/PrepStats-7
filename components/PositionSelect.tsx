import { useState } from 'react'

interface PositionSelectProps {
  value: string
  onChange: (value: string) => void
  sport?: string
}

export default function PositionSelect({ value, onChange, sport = 'FOOTBALL' }: PositionSelectProps) {
  const footballPositions = [
    { value: '', label: 'Select Position' },
    { value: 'QB', label: 'Quarterback (QB)' },
    { value: 'RB', label: 'Running Back (RB)' },
    { value: 'FB', label: 'Fullback (FB)' },
    { value: 'WR', label: 'Wide Receiver (WR)' },
    { value: 'TE', label: 'Tight End (TE)' },
    { value: 'LT', label: 'Left Tackle (LT)' },
    { value: 'LG', label: 'Left Guard (LG)' },
    { value: 'C', label: 'Center (C)' },
    { value: 'RG', label: 'Right Guard (RG)' },
    { value: 'RT', label: 'Right Tackle (RT)' },
    { value: 'DE', label: 'Defensive End (DE)' },
    { value: 'DT', label: 'Defensive Tackle (DT)' },
    { value: 'NT', label: 'Nose Tackle (NT)' },
    { value: 'OLB', label: 'Outside Linebacker (OLB)' },
    { value: 'ILB', label: 'Inside Linebacker (ILB)' },
    { value: 'MLB', label: 'Middle Linebacker (MLB)' },
    { value: 'CB', label: 'Cornerback (CB)' },
    { value: 'FS', label: 'Free Safety (FS)' },
    { value: 'SS', label: 'Strong Safety (SS)' },
    { value: 'K', label: 'Kicker (K)' },
    { value: 'P', label: 'Punter (P)' },
    { value: 'LS', label: 'Long Snapper (LS)' },
    { value: 'KR', label: 'Kick Returner (KR)' },
    { value: 'PR', label: 'Punt Returner (PR)' }
  ]

  const flagFootballPositions = [
    { value: '', label: 'Select Position' },
    { value: 'QB', label: 'Quarterback (QB)' },
    { value: 'RB', label: 'Running Back (RB)' },
    { value: 'WR', label: 'Wide Receiver (WR)' },
    { value: 'C', label: 'Center (C)' },
    { value: 'DE', label: 'Defensive End (DE)' },
    { value: 'LB', label: 'Linebacker (LB)' },
    { value: 'CB', label: 'Cornerback (CB)' },
    { value: 'S', label: 'Safety (S)' }
  ]

  const positions = sport === 'FLAG_FOOTBALL' ? flagFootballPositions : footballPositions

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ 
        width: '100%', 
        padding: '10px', 
        border: '1px solid #ddd', 
        borderRadius: '5px', 
        fontSize: '16px',
        backgroundColor: 'white'
      }}
    >
      {positions.map((position) => (
        <option key={position.value} value={position.value}>
          {position.label}
        </option>
      ))}
    </select>
  )
}
