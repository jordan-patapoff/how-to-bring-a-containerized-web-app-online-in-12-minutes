# set base image
FROM public.ecr.aws/docker/library/python:3.8

# set the working directory in the container
WORKDIR /code

# copy the dependencies file to the working directory
COPY requirements.txt .

# install dependencies
RUN pip install -r requirements.txt

# copy the server.py file to the working directory
COPY server.py .

# https://docs.docker.com/engine/reference/builder/#expose
EXPOSE 8080

# command to run on container start
CMD [ "python", "./server.py" ]
