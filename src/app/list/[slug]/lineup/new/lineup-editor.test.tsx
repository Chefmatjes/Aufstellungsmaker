import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LineupEditor } from '@/app/list/[slug]/lineup/new/lineup-editor'

// Mock sub-components to keep tests simple
vi.mock('@/components/football-field', () => ({
  FootballField: () => <div data-testid="football-field" />
}))

vi.mock('@/components/player-pool', () => ({
  PlayerPool: () => <div data-testid="player-pool" />
}))

describe('LineupEditor', () => {
  const mockList = {
    id: 'l1',
    share_slug: 'test-list',
    title: 'Test List',
    requires_substitutes: true,
    allow_player_adds: false,
    owner_id: 'u1',
    description: '',
    is_public: false,
    created_at: '',
    updated_at: ''
  }

  const mockCandidates = [
    { id: 'c1', name: 'Player 1', category: 'Tor', list_id: 'l1', created_at: '', added_by: 'u1' }
  ]

  it('renders correctly', () => {
    render(<LineupEditor list={mockList} candidates={mockCandidates} userId="u1" />)
    expect(screen.getByText('Aufstellung erstellen')).toBeInTheDocument()
    expect(screen.getByText('Test List')).toBeInTheDocument()
    expect(screen.getByTestId('football-field')).toBeInTheDocument()
    expect(screen.getByTestId('player-pool')).toBeInTheDocument()
  })

  it('shows substitute bench when required', () => {
    render(<LineupEditor list={mockList} candidates={mockCandidates} userId="u1" />)
    expect(screen.getByText('Ersatzbank')).toBeInTheDocument()
  })

  it('hides substitute bench when not required', () => {
    const noSubsList = { ...mockList, requires_substitutes: false }
    render(<LineupEditor list={noSubsList} candidates={mockCandidates} userId="u1" />)
    expect(screen.queryByText('Ersatzbank')).not.toBeInTheDocument()
  })
})
