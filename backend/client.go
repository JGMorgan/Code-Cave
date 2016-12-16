package main

type Client struct {
    connection *websocket.Conn
    send chan []byte
    room_number uint32
    name string
}
