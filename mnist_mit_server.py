from flask import request
import cv2
from tensorflow.keras.models import load_model
import base64
import numpy as np
from flask import Flask
from flask import Response

app = Flask(__name__)

model = None


# curl -d "data=abc1234" -X POST http://localhost:8888/predict
@app.route('/predict', methods=['POST'])
def predict():
    content = request.form['data']

    # https://stackoverflow.com/questions/33521891/from-jpg-to-b64encode-to-cv2-imread
    img = np.fromstring(base64.b64decode(content[22:]), dtype=np.uint8)
    character = cv2.imdecode(img, 0)

    resized_character = cv2.resize(character, (28, 28)).astype('float32') / 255
    number = model.predict_classes(resized_character.reshape((1, 784)))[0]

    resp = Response(str(number))
    # https://stackoverflow.com/questions/5584923/a-cors-post-request-works-from-plain-javascript-but-why-not-with-jquery
    # https://stackoverflow.com/questions/25860304/how-do-i-set-response-headers-in-flask
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


# curl -d "data=abc1234" -X POST http://localhost:8888/sample_post
@app.route('/sample_post', methods=['POST'])
def sample_post():
    content = request.form['data']
    return content


# curl http://localhost:8888
@app.route('/')
def hello_world():
    character = cv2.imread('3.png', 0)
    resized_character = cv2.resize(character, (28, 28)).astype('float32') / 255
    number = model.predict_classes(resized_character.reshape((1, 28 * 28)))[0]

    resp = Response(str(number))
    # https://stackoverflow.com/questions/5584923/a-cors-post-request-works-from-plain-javascript-but-why-not-with-jquery
    # https://stackoverflow.com/questions/25860304/how-do-i-set-response-headers-in-flask
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


if __name__ == '__main__':
    model = load_model("model.h5")
    app.run(debug=True, host='0.0.0.0', port=8888)