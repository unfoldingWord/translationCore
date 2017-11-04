#!/bin/bash

sudo add-apt-repository --yes ppa:ubuntu-wine/ppa
sudo add-apt-repository --yes ppa:arx/release
sudo apt-get update -d
sudo apt-get install -y -q innoextract wine python-software-properties

wine --version
innoextract --version