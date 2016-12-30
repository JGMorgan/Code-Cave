package main

import (
    "github.com/gorilla/websocket"
    "encoding/json"
    //"log"
)

type Client struct {
    connection *websocket.Conn
    send chan *Code
    out chan *STDOut
    room_number uint32
    name string
    room_changed bool
}

func newClient(conn *websocket.Conn, client_name string, room_number uint32) *Client {
    client := &Client{
        connection: conn,
        send: make(chan *Code, 1024),
        out: make(chan *STDOut, 512),
        name: client_name,
        room_number: room_number,
        room_changed: false}
    return client
}

func (c *Client) Receive(hub *Hub) {
	defer func() {
        hub.unregister <- c
		c.connection.Close()
	}()
    var code Code
    var out STDOut
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
        err = json.Unmarshal(message, &out)
        if err != nil {
			break
		}
        if out.Language == "" && code.Language == "" {
            err = json.Unmarshal(message, &conninfo)
            if err != nil {
    			break
    		}
            c.room_number = conninfo.Room_number
            c.name = conninfo.Client_name
            hub.register <- c
        }else if out.Output == "" && out.Error == ""{
            outmessage := &OutBoundMessage{
                room_number: c.room_number,
                code: &code,
            }
            hub.messages <- outmessage
        }else{
            output := &OutBoundOutput{
                room_number: c.room_number,
                output: &out,
            }
            hub.outputs <- output
        }
	}
}

func (c *Client) Send(hub *Hub) {
    for {
        if c.room_changed == true {
            c.room_changed = false
            rnmessage, err := json.Marshal(struct {Room_number uint32} {c.room_number})
            if err != nil {
                return
            }
            c.connection.WriteMessage(websocket.TextMessage, rnmessage)
        }

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
            message, err := json.Marshal(code)
            if err != nil {
    			return
    		}
			c.connection.WriteMessage(websocket.TextMessage, message)
		}
        for i := 0; i < len(c.out); i++ {
            out, ok := <-c.out
            if !ok {
    			c.connection.WriteMessage(websocket.CloseMessage, []byte{})
    			return
    		}
            message, err := json.Marshal(out)
            if err != nil {
    			return
    		}
			c.connection.WriteMessage(websocket.TextMessage, message)
		}
	}
}
