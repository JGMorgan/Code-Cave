package main

import (
    "log"
    "bytes"
    "os/exec"
    "fmt"
    "strconv"
)

type File struct {
    name, content string;
}

func CreateContainer(language string, files []File) {
    var args = []string{"run"}

    args = append(args, "-e", "NUM_FILES="+ strconv.Itoa(len(files)));

    //add env variables to docker command containing file info
    for i := 0; i < len(files); i++ {
        var n = strconv.Itoa(i);
        args = append(args, "-e", "FILE_NAME_"+n+"="+files[i].name);
        args = append(args, "-e", "FILE_CONTENT_"+n+"="+files[i].content);
    }

    switch language {
    case "python" :
        args = append(args, "shared_python");
        break;
    case "golang" :
        fmt.Println("Using golang");
        args = append(args, "shared_golang");
        break;
    }

    //fmt.Println(args);

    cmd := exec.Command("docker", args...)
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
    fmt.Println(stdoutbuf)
    stderrbuf := new(bytes.Buffer)
    stderrbuf.ReadFrom(stderr)
}

func main() {
   var files = []File {
   //print(\"Hello World! I am python!\")
       File {
           name: "main.py",
           content: `package main
import "fmt"
func main() {
    fmt.Println("hello world")
}`,
       },
       File {
           name: "lib.py",
           content: "FOO = 1",
       },
       File {
           name: "text.txt",
           content: "The quick brown fox jumps over the lazy dog",
       },
   }
   CreateContainer("golang", files)
}
