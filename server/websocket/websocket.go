package websocket

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type WebSocketService struct {
	clients   map[*websocket.Conn]bool
	mutex     sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func NewWebSocketService() *WebSocketService {
	return &WebSocketService{
		clients: make(map[*websocket.Conn]bool),
	}
}

func (ws *WebSocketService) HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	ws.mutex.Lock()
	ws.clients[conn] = true
	ws.mutex.Unlock()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			ws.mutex.Lock()
			delete(ws.clients, conn)
			ws.mutex.Unlock()
			break
		}
	}
}

func (ws *WebSocketService) Broadcast(eventType string, data interface{}) {
	message := map[string]interface{}{
		"type": eventType,
		"data": data,
	}

	ws.mutex.Lock()
	defer ws.mutex.Unlock()

	for client := range ws.clients {
		err := client.WriteJSON(message)
		if err != nil {
			log.Println("Error broadcasting message:", err)
			client.Close()
			delete(ws.clients, client)
		}
	}
}
