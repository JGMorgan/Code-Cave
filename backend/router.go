package main

import (
	"io"
	"net/http"
    "log"
    "os/exec"
    "bytes"
)

func runGo(w http.ResponseWriter, r *http.Request) {
    cmd := exec.Command("go", "run", "test.go")
	stdout, err := cmd.StdoutPipe()
    if err != nil {
		log.Fatal(err)
	}
    err = cmd.Start();
    if err != nil {
		log.Fatal(err)
	}

    buf := new(bytes.Buffer)
	buf.ReadFrom(stdout)

    io.WriteString(w, buf.String())
}

func main() {
	http.HandleFunc("/run/GoLang", runGo)
	http.ListenAndServe(":8000", nil)
}
