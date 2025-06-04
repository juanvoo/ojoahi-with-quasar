import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  function setUser(userData) {
    user.value = userData
  }

  function logout() {
    user.value = null
  }

  return { user, setUser, logout }
})