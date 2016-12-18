package main

import (
    "github.com/gorilla/websocket"
    "math/rand"
    "net/http"
    "bytes"
)

type Hub struct {
    rooms map[uint32][]*Client
    /*
    Since go spins up a goroutine for everytime a client hits the websocket
    all accesses and mutations to the rooms map will be handled only by the hub
    if a client needs to be added to removed this will be handled using channels
    */
    messages chan *OutBoundMessage
	register chan *Client
	unregister chan *Client
}

type ConnectionInfo struct {
    room_number uint32
    client_name string
}

var upgrader = websocket.Upgrader {
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
}

func NewHub() *Hub{
    return &Hub{
		rooms:  make(map[uint32][]*Client),
        messages: make(chan *OutBoundMessage),
        register: make(chan *Client),
        unregister: make(chan *Client),
	}
}

func handleCodeShare(hub *Hub, w http.ResponseWriter, r *http.Request) {
    var conninfo ConnectionInfo
    buf := new(bytes.Buffer)
	buf.ReadFrom(r.Body)
    json.Unmarshal(buf.Bytes(), &conninfo)

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        //log.Println(err)
        return
    }
    client := &Client{
        connection: conn,
        send: make(chan []byte, 1024),
        name: conninfo.client_name,
        room_number: conninfo.room_number}
    hub.register <- client
	client.Receive()
}

func (hub *Hub) run() {
    for {
		select {
		case client := <-h.register:
            /*
            exists defaults to false because if a room number is specified then
            we don't want to trip that for loop, otherwise the for loop will be tripped
            if room number is 0 then it is considered to not exist
            */
            exists := false
            for conninfo.room_number == 0 || exists {
                conninfo.room_number = rand.Uint32()
                _, exists = hub.rooms[conninfo.room_number]
            }
            _, exists := hub.rooms[conninfo.room_number]
            if !exists {
                hub.rooms[conninfo.room_number] = []*Client{client}
            }else{
                hub.rooms[conninfo.room_number] = append(hub.rooms[conninfo.room_number], client)
            }
		case client := <-h.unregister:
            clients, ok := h.rooms[client.room_number];
			if ok {
                //if there is nobody in that room, then we close the room
                if len(clients) == 0 {
                    delete(h.rooms, client.room_number)
                }else{
                    for i, _ := range clients {
                        //else delete client that left
                        if client == h.rooms[client.room_number][i] {
                            h.rooms[client.room_number] = append(h.rooms[client.room_number][:i], h.rooms[client.room_number][i+1:]...)
                        }
                    }
                }
				close(client.send)
			}
        }
	}
}
