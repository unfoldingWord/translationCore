#!/bin/sh -l

for command in "$@"
do
    echo "$command"
    eval "$command"
done
