
from flask import Flask, jsonify
from flask_cors import CORS
from database import get_connection
from auth import auth 
from workouts import workouts
from bmr import bmr
from weight_logs import weight_logs
app = Flask(__name__)


# Allow frontend to communicate with backend
CORS(app)

app.register_blueprint(auth)
app.register_blueprint(workouts)
app.register_blueprint(bmr)
app.register_blueprint(weight_logs)

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to FitTrack Backend!",
        "status": "Running successfully"
    })

@app.route("/api/test")
def test():
    return jsonify({
        "success": True,
        "message": "FitTrack API is working!"
    })


@app.route("/api/db-test")
def db_test():

    try:
        connection = get_connection()

        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE()")

        result = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify({
            "success": True,
            "database": result[0],
            "message": "MySQL connected successfully!"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)

from database import get_connection