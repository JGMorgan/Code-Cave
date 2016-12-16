package main

import (
    "github.com/gorilla/websocket"
    "rand"
)

type Hub struct {
    rooms map[int][]*Client
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
		rooms:  make(map[int][]*Client)
	}
}

func handleCodeShare(hub *Hub, w http.ResponseWriter, r *http.Request) {
    var conninfo ConnectionInfo
    buf := new(bytes.Buffer)
	buf.ReadFrom(r.Body)
    json.Unmarshal(buf.Bytes(), &conninfo)

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

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        //log.Println(err)
        return
    }
    client := &Client{
        conn: conn,
        send: make(chan []byte, 1024),
        name: conninfo.client_name,
        room_number: conninfo.room_number}
    _, exists = hub.rooms[conninfo.room_number]
    if !exists {
        hub.rooms[conninfo.room_number] = []*Client{client}
    }else{
        hub.rooms[conninfo.room_number] = append(hub.rooms[conninfo.room_number], client)
    }
}
