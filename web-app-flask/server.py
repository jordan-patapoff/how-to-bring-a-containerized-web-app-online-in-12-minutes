from flask import Flask
server = Flask(__name__)

@server.route('/')
def hello_world():
    return 'FLASK How to bring a containerized web app online in 12 minutes (from start to finish)'

if __name__ == "__main__":
    server.run(host='0.0.0.0', port=8080)
