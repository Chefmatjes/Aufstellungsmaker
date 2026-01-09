import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FootballField } from '@/components/football-field'

describe('FootballField', () => {
  const mockPlayers = [
    { id: '1', candidateId: 'c1', name: 'Player 1', xPercent: 50, yPercent: 50, category: 'Tor' }
  ]

  it('renders players on the field', () => {
    render(<FootballField players={mockPlayers} readOnly />)
    expect(screen.getByText('P1')).toBeInTheDocument()
    // FootballField renders only the last name part in the label
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows drop hint when empty', () => {
    render(<FootballField players={[]} />)
    expect(screen.getByText('Ziehe Spieler hierher')).toBeInTheDocument()
  })

  it('calls onPlayerRemove when remove button is clicked', () => {
    const onPlayerRemove = vi.fn()
    render(<FootballField players={mockPlayers} onPlayerRemove={onPlayerRemove} />)
    
    const removeButton = screen.getByText('×')
    fireEvent.click(removeButton)
    
    expect(onPlayerRemove).toHaveBeenCalledWith('1')
  })
})
