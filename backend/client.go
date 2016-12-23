package main

import (
    "github.com/gorilla/websocket"
    "encoding/json"
    "log"
)

type Client struct {
    connection *websocket.Conn
    send chan *Code
    room_number uint32
    name string
}

type OutBoundMessage struct {
    room_number uint32
    code *Code
}

func (c *Client) Receive(hub *Hub) {
	defer func() {
        hub.unregister <- c
		c.connection.Close()
	}()
    var code Code
    var conninfo ConnectionInfo
	for {
		_, message, err := c.connection.ReadMessage()
		if err != nil {
			break
		}
        err = json.Unmarshal(message, &code)
        if err != nil {
			break
		}
        if code.Content == "" && code.Language == "" {
            err = json.Unmarshal(message, &conninfo)
            if err != nil {
    			break
    		}
            c.room_number = conninfo.Room_number
            c.name = conninfo.Client_name
            hub.register <- c
        }else{
            outmessage := &OutBoundMessage{
                room_number: c.room_number,
                code: &code,
            }
            hub.messages <- outmessage
        }
	}
}

func (c *Client) Send(hub *Hub) {
    for {
		for i := 0; i < len(c.send); i++ {
            code, ok := <-c.send
            /*
            if ok == false then the channel has been closed so the client
            is no longer active
            */
            if !ok {
    			c.connection.WriteMessage(websocket.CloseMessage, []byte{})
    			return
    		}
            log.Println("sending")
            log.Println(code.Content)
            message, err := json.Marshal(code)
            if err != nil {
    			return
    		}
			c.connection.WriteMessage(websocket.TextMessage, message)
		}
	}
}
