import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  signup: async (email, password, username) => {
    set({ isLoading: true })
    const result = await authService.signup(email, password, username)
    if (result.success) {
      set({ user: result.user, isLoading: false })
    } else {
      set({ error: result.error, isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    const result = await authService.login(email, password)
    if (result.success) {
      set({ user: result.user, profile: result.profile, isLoading: false })
    } else {
      set({ error: result.error, isLoading: false })
    }
  },

  logout: async () => {
    await authService.logout()
    set({ user: null, profile: null })
  },

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
}))
