import sys
import json
from bson import json_util
from bson.json_util import dumps

from flask import Flask, render_template
from pymongo import MongoClient

reload(sys)
sys.setdefaultencoding("utf-8")

app = Flask(__name__)

MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'indicativos'
COLLECTION_NAME = 'crimes'
FIELDS = { 'MUNICIPIO': True, 'FATO': True,
           'QTDE': True, 'ANO': True, 'MES': True, "_id": False
         }

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/data/crimes')
def crimes():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    crimes = collection.find(projection=FIELDS)
    json_crimes = []
    for crime in crimes:
        json_crimes.append(crime)
    json_crimes = json.dumps(json_crimes, default=json_util.default)
    connection.close()
    return json_crimes

@app.errorhandler(500)
def page_not_found(e):
    return e, 50

if __name__ == '__main__':
    app.run(port=8000, debug=True)
