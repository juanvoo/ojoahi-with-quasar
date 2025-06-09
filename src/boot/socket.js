import { boot } from "quasar/wrappers"
import { io } from "socket.io-client"

let socket = null

// Function to connect socket when user logs in
export function connectSocket() {
  if (socket && !socket.connected) {
    socket.connect()
  }
}

// Function to disconnect socket when user logs out
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

export default boot(({ app }) => {
  // Create socket connection
  const createSocket = () => {
    if (socket) return socket

    socket = io(process.env.SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    })

    // Socket event handlers
    socket.on("connect", () => {
      console.log("Socket connected")
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    // Make socket available as $socket
    app.config.globalProperties.$socket = socket

    return socket
  }

  // Initialize socket
  createSocket()
})

export { socket }
