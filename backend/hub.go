package main

import (
    "github.com/gorilla/websocket"
    "math/rand"
    "net/http"
    "bytes"
    "encoding/json"
    "log"
)

type Hub struct {
    rooms map[uint32][]*Client
    /*
    Since go spins up a goroutine for everytime a client hits the websocket
    all accesses and mutations to the rooms map will be handled only by the hub
    if a client needs to be added to removed this will be handled using channels
    */
    messages chan *OutBoundMessage
    /*
    Stdout only needs to be sent when the code is ran so it is on it's own
    channel to free up the code channel
    */
    outputs chan *OutBoundOutput
    register chan *Client
    unregister chan *Client
}

var upgrader = websocket.Upgrader {
    ReadBufferSize: 1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool { return true },
}

func NewHub() *Hub {
    return &Hub{
        rooms:  make(map[uint32][]*Client),
        messages: make(chan *OutBoundMessage),
        outputs: make(chan *OutBoundOutput),
        register: make(chan *Client),
        unregister: make(chan *Client),
    }
}

func HandleCodeShare(hub *Hub, w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
        return
    }
    var conninfo ConnectionInfo
    buf := new(bytes.Buffer)
    buf.ReadFrom(r.Body)
    json.Unmarshal(buf.Bytes(), &conninfo)
    client := newClient(conn, conninfo.Client_name, conninfo.Room_number)
    go client.Receive(hub)
    client.Send(hub)
}

func (hub *Hub) Run() {
    for {
        select {
        case message := <-hub.messages:
            log.Println("message")
            for i, _ := range hub.rooms[message.room_number] {
                hub.rooms[message.room_number][i].send <- message.code
            }
        case output := <-hub.outputs:
            log.Println("output")
            for i, _ := range hub.rooms[output.room_number] {
                hub.rooms[output.room_number][i].out <- output.output
            }
        case client := <-hub.register:
            log.Println("register")
            /*
            exists defaults to false because if a room number is specified then
            we don't want to trip that for loop, otherwise the for loop will be tripped
            if room number is 0 then it is considered to not exist
            */
            exists := false
            for client.room_number == 0 || exists {
                client.room_number = rand.Uint32()
                _, exists = hub.rooms[client.room_number]
            }
            _, exists = hub.rooms[client.room_number]
            client.room_changed = true
            if !exists {
                hub.rooms[client.room_number] = []*Client{client}
            }else{
                hub.rooms[client.room_number] = append(hub.rooms[client.room_number], client)
            }
        case client := <-hub.unregister:
            log.Println("unregister")
            clients, ok := hub.rooms[client.room_number];
            if ok {
                //if there is nobody in that room, then we close the room
                if len(clients) == 0 {
                    delete(hub.rooms, client.room_number)
                }else{
                    for i, _ := range clients {
                        //else delete client that left
                        if client == hub.rooms[client.room_number][i] {
                            hub.rooms[client.room_number] = append(hub.rooms[client.room_number][:i], hub.rooms[client.room_number][i+1:]...)
                        }
                    }
                }
                close(client.send)
            }
        }
    }
}
