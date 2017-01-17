package main

import (
    //"io"
    "net/http"
    "log"
    "os/exec"
    "encoding/json"
    "bytes"
    //"fmt"
    //"io/ioutil"
    "os"
)

func handleCors(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET")
    w.Header().Set("Access-Control-Max-Age", "3600")
    w.Header().Set("Access-Control-Allow-Headers",
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
}

func runPython(w http.ResponseWriter, r *http.Request) {
    defer exec.Command("rm", "test.py").Start()

    handleCors(w)

    var code Code

    buf := new(bytes.Buffer)
    buf.ReadFrom(r.Body)
    json.Unmarshal(buf.Bytes(), &code)

    f, err := os.Create("./test.py")
    if err != nil {
        log.Fatal(err)
    }

    _, err = f.WriteString(code.Content)
    if err != nil {
        log.Fatal(err)
    }

    f.Sync()
    f.Close()

    cmd := exec.Command("python", "test.py")
    stdout, err := cmd.StdoutPipe()
    if err != nil {
        log.Fatal(err)
    }
    stderr, err := cmd.StderrPipe()
    if err != nil {
        log.Fatal(err)
    }
    err = cmd.Start();
    if err != nil {
        log.Fatal(err)
    }

    stdoutbuf := new(bytes.Buffer)
    stdoutbuf.ReadFrom(stdout)
    stderrbuf := new(bytes.Buffer)
    stderrbuf.ReadFrom(stderr)
    out := STDOut{Language: "Python",
        Output: stdoutbuf.String(),
        Error: stderrbuf.String()}
    b, err := json.Marshal(out)
    w.Write(b)
}

func runGo(w http.ResponseWriter, r *http.Request) {
    defer exec.Command("rm", "test.go").Start()

    handleCors(w)

    var code Code

    buf := new(bytes.Buffer)
    buf.ReadFrom(r.Body)
    json.Unmarshal(buf.Bytes(), &code)
    f, err := os.Create("./test.go")
    if err != nil {
        log.Fatal(err)
    }

    _, err = f.WriteString(code.Content)
    if err != nil {
        log.Fatal(err)
    }

    f.Sync()
    f.Close()

    cmd := exec.Command("go", "run", "test.go")
    stdout, err := cmd.StdoutPipe()
    if err != nil {
        log.Fatal(err)
    }
    stderr, err := cmd.StderrPipe()
    if err != nil {
        log.Fatal(err)
    }
    err = cmd.Start();
    if err != nil {
        log.Fatal(err)
    }

    stdoutbuf := new(bytes.Buffer)
    stdoutbuf.ReadFrom(stdout)
    stderrbuf := new(bytes.Buffer)
    stderrbuf.ReadFrom(stderr)
    out := STDOut{Language: "Go",
        Output: stdoutbuf.String(),
        Error: stderrbuf.String()}
    b, err := json.Marshal(out)
    w.Write(b)
}

func runPythonDocker(w http.ResponseWriter, r *http.Request) {
    handleCors(w);

    var code Code

    buf := new(bytes.Buffer)
    buf.ReadFrom(r.Body)
    json.Unmarshal(buf.Bytes(), &code)

    files := []File {
        File {
            name: "main.py",
            content: code.Content,
        },
    }

    out := STDOut{Language: "Python",
        Output: CreateContainer("python", files),
        Error: ""}
    b, err := json.Marshal(out);

    if err != nil {
        log.Fatal(err)
    }

    w.Write(b)
}

func main() {
    hub := NewHub()
    go hub.Run()
    http.HandleFunc("/run/go", runGo)
    http.HandleFunc("/run/python", runPython)
    http.HandleFunc("/docker/run/python", runPythonDocker)
    http.HandleFunc("/share", func(w http.ResponseWriter, r *http.Request) {
        HandleCodeShare(hub, w, r)
    })
    err := http.ListenAndServe(":8000", nil)
    if err != nil {
        log.Println(err)
    }
}
