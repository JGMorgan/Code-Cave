package main

type Code struct {
    Language string
    Content string
}

type STDOut struct {
    Language string
    Output string
    Error string
}

type ConnectionInfo struct {
    Room_number uint32
    Client_name string
}

type OutBoundMessage struct {
    room_number uint32
    code *Code
}

type OutBoundOutput struct {
    room_number uint32
    output *STDOut
}
