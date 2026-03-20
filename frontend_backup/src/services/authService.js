import { supabase } from './supabaseClient'

export const authService = {
  async signup(email, password, username) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: authData.user.id, email, username, role: 'user' }])
      if (profileError) throw profileError

      return { success: true, user: authData.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      return { success: true, user: data.user, profile }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    return { success: !error, error }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return data.session
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }
}
