import { useState } from 'react'

interface PositionSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  sport?: string
}

export default function PositionSelect({ value, onChange, sport = 'FOOTBALL' }: PositionSelectProps) {
  const footballPositions = [
    { value: 'QB', label: 'QB' },
    { value: 'RB', label: 'RB' },
    { value: 'WR', label: 'WR' },
    { value: 'TE', label: 'TE' },
    { value: 'OL', label: 'OL' },
    { value: 'DL', label: 'DL' },
    { value: 'LB', label: 'LB' },
    { value: 'DB', label: 'DB' },
    { value: 'LS', label: 'LS' },
    { value: 'K', label: 'K' }
  ]

  const handlePositionToggle = (positionValue: string) => {
    const currentPositions = Array.isArray(value) ? value : []
    
    if (currentPositions.includes(positionValue)) {
      onChange(currentPositions.filter(p => p !== positionValue))
    } else if (currentPositions.length < 3) {
      onChange([...currentPositions, positionValue])
    }
  }

  const currentPositions = Array.isArray(value) ? value : []

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px', backgroundColor: 'white' }}>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
        Select up to 3 positions ({currentPositions.length}/3)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {footballPositions.map((position) => {
          const isSelected = currentPositions.includes(position.value)
          const isDisabled = !isSelected && currentPositions.length >= 3
          
          return (
            <button
              key={position.value}
              type="button"
              onClick={() => !isDisabled && handlePositionToggle(position.value)}
              disabled={isDisabled}
              style={{
                padding: '8px 4px',
                border: `2px solid ${isSelected ? '#b3a369' : '#ddd'}`,
                borderRadius: '4px',
                backgroundColor: isSelected ? '#b3a369' : 'white',
                color: isSelected ? 'white' : isDisabled ? '#ccc' : '#333',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              {position.label}
            </button>
          )
        })}
      </div>
      {currentPositions.length > 0 && (
        <div style={{ fontSize: '14px', color: '#b3a369', fontWeight: 'bold' }}>
          Selected: {currentPositions.join(', ')}
        </div>
      )}
    </div>
  )
}
