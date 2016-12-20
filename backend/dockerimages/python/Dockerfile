FROM python:3

RUN apt-get update
RUN yes | apt-get install golang

ADD ./load_files.go /setup/load_files.go
ADD ./run.sh /run/run.sh

RUN chmod +x /run/run.sh

RUN mkdir wrkdir

ENTRYPOINT ["/run/run.sh"]
