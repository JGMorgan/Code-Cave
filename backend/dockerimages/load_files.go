package main

import(
    "fmt"
    "os"
    "strconv"
)

func main() {
    var numFiles = strconv.Atoi(os.Getenv("NUM_FILES"));

    fmt.Println(numFiles);

    for i := 0; i < numFiles; i++ {
        fmt.Println(os.Getenv("FILE_NAME_"+strconv.Itoa(i)));
    }
}
