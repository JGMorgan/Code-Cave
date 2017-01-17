package main

import (
    "log"
    "bytes"
    "os/exec"
    //"fmt"
    "strconv"
)

type File struct {
    name, content string;
}

func NewFile(name string, content string) *File {
    return &File{name: name, content: content}
}

func CreateContainer(language string, files []File) string {
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
        args = append(args, "shared_golang");
        break;
    case "haskell" :
        args = append(args, "shared_haskell");
        break;
    }

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
    //fmt.Println(stdoutbuf);

    stderrbuf := new(bytes.Buffer)
    stderrbuf.ReadFrom(stderr)
    //fmt.Println(stderrbuf)

    return stdoutbuf.String();
}

func test() {
   var files = []File {
       File {
           name: "main.py",
           content: `print("123")`,
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
   CreateContainer("python", files)
}
