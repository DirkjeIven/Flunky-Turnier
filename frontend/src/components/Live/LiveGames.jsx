import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabaseClient'

export default function LiveGames() {
  const [liveGames, setLiveGames] = useState([])
  const [upcomingGames, setUpcomingGames] = useState([])
  const [finishedGames, setFinishedGames] = useState([])

  useEffect(() => {
    fetchGames()
    
    // Real-time Updates
    const subscription = supabase
      .channel('games')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' },
        () => fetchGames()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const fetchGames = async () => {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('start_time', { ascending: true })

    setLiveGames(data?.filter((g) => g.status === 'live') || [])
    setUpcomingGames(data?.filter((g) => g.status === 'scheduled') || [])
    setFinishedGames(data?.filter((g) => g.status === 'finished') || [])
  }

  return (
    <div className="live-games">
      <section className="live">
        <h2>🔴 Live</h2>
        {liveGames.length === 0 ? (
          <p>Keine Spiele live</p>
        ) : (
          liveGames.map((game) => (
            <div key={game.id} className="game-live">
              <p>{game.team_a} vs {game.team_b}</p>
            </div>
          ))
        )}
      </section>

      <section className="upcoming">
        <h2>⏱️ Kommende Spiele</h2>
        {upcomingGames.slice(0, 5).map((game) => (
          <div key={game.id} className="game-card">
            <p>{game.team_a} vs {game.team_b}</p>
            <p>{new Date(game.start_time).toLocaleString('de-DE')}</p>
          </div>
        ))}
      </section>

      <section className="finished">
        <h2>✅ Abgeschlossene Spiele</h2>
        {finishedGames.map((game) => (
          <div key={game.id} className="game-card">
            <p>{game.team_a} vs {game.team_b}</p>
            <p>Gewinner: {game.winner}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
