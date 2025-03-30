package websocket

import (
	"net/http"
)

func WebsocketHandler(hub *Hub, w http.ResponseWriter, r *http.Request) {
	client, err := NewClient(hub, w, r)
	if err != nil {
		http.Error(w, "Could not open websocket connection", http.StatusBadRequest)
		return
	}

	go client.WritePump()
	go client.ReadPump()
}