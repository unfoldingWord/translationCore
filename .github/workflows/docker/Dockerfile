# Build commands
# sudo docker login -u <dockerhub-user>
# sudo docker build -t github_build .
# sudo docker tag github_build <dockerhub-user>/github_build:latest
# sudo docker push <dockerhub-user>/github_build:latest

FROM node:16.14.2

ARG DEBIAN_FRONTEND=noninteractive

# install dependencies
RUN dpkg --add-architecture i386 && \
    apt-get update && \
    apt-get install -yq locales git zip unzip genisoimage wine wine32 wine64 libwine libwine:i386 innoextract software-properties-common

# install npm
RUN npm install -g npm@8.5.0

# install inno setup
RUN mkdir /tmp/inno && \
    cd /tmp/inno && \
    wget -O is.exe http://files.jrsoftware.org/is/5/isetup-5.5.3.exe --no-check-certificate && \
    innoextract is.exe && \
    mkdir -p ~/".wine/drive_c/inno" && \
    cp -a app/* ~/".wine/drive_c/inno"

# configure system locale
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8

EXPOSE 3000

CMD ["/bin/bash"]
