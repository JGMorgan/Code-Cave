FROM golang

ADD ./load_and_run_files.go /setup/load_and_run_files.go
ADD ./run.sh /run/run.sh

RUN chmod +x /run/run.sh

RUN mkdir ./wrkdir
RUN ls
RUN ls ./wrkdir

ENTRYPOINT ["/run/run.sh"]
