FROM golang

ADD ./load_and_run_files.go /setup/load_and_run_files.go
ADD ./run.sh /run/run.sh

RUN chmod +x /run/run.sh

RUN mkdir /wrkdir
RUN ls -a
RUN ls -a /wrkdir

ENTRYPOINT ["/run/run.sh"]
