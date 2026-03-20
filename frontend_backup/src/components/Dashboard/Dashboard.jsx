import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../services/supabaseClient'

export default function Dashboard() {
  const { profile } = useAuthStore()
  const [games, setGames] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [bets, setBets] = useState([])

  useEffect(() => {
    fetchGames()
    fetchUserRank()
    fetchUserBets()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('start_time', { ascending: true })
    
    setGames(data || [])
  }

  const fetchUserRank = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, points')
      .order('points', { ascending: false })
    
    const rank = data?.findIndex((p) => p.id === profile?.id) + 1
    setUserRank(rank)
  }

  const fetchUserBets = async () => {
    const { data } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', profile?.id)
    
    setBets(data || [])
  }

  return (
    <div className="dashboard">
      <h1>Willkommen, {profile?.username}!</h1>
      
      <div className="stats">
        <div className="stat-card">
          <h3>Punkte</h3>
          <p>{profile?.points || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Platzierung</h3>
          <p>#{userRank}</p>
        </div>
        <div className="stat-card">
          <h3>Richtige Tipps</h3>
          <p>{profile?.correct_predictions || 0}</p>
        </div>
      </div>

      <div className="games-section">
        <h2>Spiele</h2>
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <p>{game.team_a} vs {game.team_b}</p>
            <p>Status: {game.status}</p>
            {game.status === 'finished' && (
              <p>Gewinner: {game.winner}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
