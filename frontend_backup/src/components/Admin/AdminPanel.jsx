import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'
import { useAuthStore } from '../../store/authStore'

export default function AdminPanel() {
  const { profile } = useAuthStore()
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [winner, setWinner] = useState('')

  if (profile?.role !== 'admin') {
    return <p>Zugriff verweigert</p>
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('start_time', { ascending: true })
    
    setGames(data || [])
  }

  const updateGameStatus = async (gameId, status) => {
    const { error } = await supabase
      .from('games')
      .update({ status })
      .eq('id', gameId)
    
    if (!error) fetchGames()
  }

  const setGameWinner = async () => {
    if (!selectedGame || !winner) return

    const loser = selectedGame.team_a === winner ? selectedGame.team_b : selectedGame.team_a

    const { error } = await supabase
      .from('games')
      .update({ 
        winner, 
        loser,
        status: 'finished'
      })
      .eq('id', selectedGame.id)

    if (!error) {
      // Punkte aktualisieren
      await updatePlayerPoints(selectedGame.id, winner)
      fetchGames()
    }
  }

  const updatePlayerPoints = async (gameId, winner) => {
    const { data: correctBets } = await supabase
      .from('bets')
      .select('user_id')
      .eq('game_id', gameId)
      .eq('predicted_winner', winner)

    for (const bet of correctBets || []) {
      await supabase
        .from('bets')
        .update({ is_correct: true, points_awarded: 1 })
        .eq('user_id', bet.user_id)
        .eq('game_id', gameId)

      // Profile aktualisieren
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, correct_predictions')
        .eq('id', bet.user_id)
        .single()

      await supabase
        .from('profiles')
        .update({
          points: (profile?.points || 0) + 1,
          correct_predictions: (profile?.correct_predictions || 0) + 1
        })
        .eq('id', bet.user_id)
    }
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <div className="games-list">
        {games.map((game) => (
          <div key={game.id} className="admin-game-card">
            <p>{game.team_a} vs {game.team_b}</p>
            <p>Status: {game.status}</p>
            
            <div className="actions">
              <button onClick={() => updateGameStatus(game.id, 'live')}>
                Starten
              </button>
              <button onClick={() => updateGameStatus(game.id, 'scheduled')}>
                Zurück
              </button>
              <button onClick={() => setSelectedGame(game)}>
                Gewinner setzen
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedGame && (
        <div className="winner-form">
          <h2>Gewinner für {selectedGame.team_a} vs {selectedGame.team_b}</h2>
          <button onClick={() => setWinner(selectedGame.team_a)}>
            {selectedGame.team_a}
          </button>
          <button onClick={() => setWinner(selectedGame.team_b)}>
            {selectedGame.team_b}
          </button>
          <button onClick={setGameWinner} disabled={!winner}>
            Speichern
          </button>
        </div>
      )}
    </div>
  )
}
