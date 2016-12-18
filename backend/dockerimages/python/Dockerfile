FROM python:3

RUN apt-get update
RUN yes | apt-get install golang

ADD ./load_files.go /setup/load_files.go
RUN ls /setup -a
RUN go run /setup/load_files.go

#RUN echo "test"
#RUN echo "$FILES"
