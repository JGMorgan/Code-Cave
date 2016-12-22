FROM haskell:7

RUN apt-get update
RUN yes | apt-get install golang

ADD ./load_and_run_files.go /setup/load_and_run_files.go
ADD ./run.sh /run/run.sh

RUN chmod +x /run/run.sh

RUN mkdir wrkdir

ENTRYPOINT ["/run/run.sh"]
