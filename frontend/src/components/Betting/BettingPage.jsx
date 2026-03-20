import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../services/supabaseClient'

export default function BettingPage() {
  const { profile } = useAuthStore()
  const [games, setGames] = useState([])
  const [bets, setBets] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchGames()
    fetchUserBets()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'scheduled')
      .order('start_time', { ascending: true })
    
    setGames(data || [])
  }

  const fetchUserBets = async () => {
    const { data } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', profile?.id)
    
    const betMap = {}
    data?.forEach((bet) => {
      betMap[bet.game_id] = bet.predicted_winner
    })
    setBets(betMap)
  }

  const handleBetChange = (gameId, team) => {
    setBets((prev) => ({
      ...prev,
      [gameId]: team
    }))
  }

  const handleSubmit = async () => {
    for (const [gameId, team] of Object.entries(bets)) {
      const { error } = await supabase
        .from('bets')
        .upsert({
          user_id: profile?.id,
          game_id: parseInt(gameId),
          predicted_winner: team
        })
      
      if (error) console.error(error)
    }
    setSubmitted(true)
  }

  if (submitted) {
    return <p>Wetten gespeichert!</p>
  }

  return (
    <div className="betting-page">
      <h1>Gib deine Wetten ab</h1>
      {games.map((game) => (
        <div key={game.id} className="betting-card">
          <p>{game.team_a} vs {game.team_b}</p>
          <div>
            <button
              onClick={() => handleBetChange(game.id, game.team_a)}
              className={bets[game.id] === game.team_a ? 'selected' : ''}
            >
              {game.team_a}
            </button>
            <button
              onClick={() => handleBetChange(game.id, game.team_b)}
              className={bets[game.id] === game.team_b ? 'selected' : ''}
            >
              {game.team_b}
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} className="submit-btn">
        Wetten abspeichern
      </button>
    </div>
  )
}
