package main

import(
    "fmt"
    "os"
    "strconv"
    "io/ioutil"
    "os/exec"
    "log"
    "bytes"
)

func main() {
    var numFiles, err = strconv.Atoi(os.Getenv("NUM_FILES"));

    if err != nil {
      fmt.Println("Error getting numFiles");
      return;
    }

    for i := 0; i < numFiles; i++ {
        var fileName = os.Getenv("FILE_NAME_"+strconv.Itoa(i));
        var fileContent = os.Getenv("FILE_CONTENT_"+strconv.Itoa(i));
        err := ioutil.WriteFile("/wrkdir/"+fileName, []byte(fileContent), 0644)
        if(err != nil) {
          fmt.Println(err);
          return;
        }
    }

    cmd := exec.Command("go", "run", ("/wrkdir/"+os.Getenv("FILE_NAME_0")) )
    stdout, err := cmd.StdoutPipe()
    if err != nil {
        log.Fatal(err);
    }
    stderr, err := cmd.StderrPipe()
    if err != nil {
        log.Fatal(err);
    }
    err = cmd.Start();
    if err != nil {
        log.Fatal(err);
    }
    stdoutbuf := new(bytes.Buffer)
    stdoutbuf.ReadFrom(stdout)
    fmt.Println(stdoutbuf)
    stderrbuf := new(bytes.Buffer)
    stderrbuf.ReadFrom(stderr)
}
