package main

import (
    "github.com/gorilla/websocket"
    "encoding/json"
)

type Client struct {
    connection *websocket.Conn
    send chan []byte
    room_number uint32
    name string
}

type OutBoundMessage struct {
    room_number uint32
    code *Code
}

func (c *Client) Receive(hub *Hub) {
	defer func() {
        hub.unregister <- client
		c.connection.Close()
	}()
    var code Code
	for {
		_, message, err := c.connection.ReadMessage()
		if err != nil {
			break
		}
        json.Unmarshal(message, &code)
        c.Send(hub, &code)
	}
}

func (c *Client) Send(hub *Hub, code *Code) {
    clients := hub.rooms[c.room_number]
	for _, elem := range clients{
        out, _ := json.Marshal(&code)
        err := elem.connection.WriteMessage(websocket.BinaryMessage, out);
        if err != nil {
			return
		}
	}
}
