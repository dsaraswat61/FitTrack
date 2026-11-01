
from flask import Blueprint, jsonify
from database import get_connection

bmr = Blueprint("bmr", __name__)


@bmr.route("/api/bmr/<int:user_id>", methods=["GET"])
def calculate_bmr(user_id):

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Fetch user details from MySQL
        cursor.execute("""
            SELECT age, height, weight, sex
            FROM users
            WHERE id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        age = user["age"]
        height = user["height"]
        weight = user["weight"]
        sex = user["sex"]

        # Check whether fitness details are available
        if not all([age, height, weight, sex]):
            return jsonify({
                "success": False,
                "message": "Please update your fitness details"
            }), 400

        # Mifflin-St Jeor formula (adult estimate)
        if sex.lower() == "male":
            bmr_value = (10 * weight) + (6.25 * height) - (5 * age) + 5

        elif sex.lower() == "female":
            bmr_value = (10 * weight) + (6.25 * height) - (5 * age) - 161

        else:
            return jsonify({
                "success": False,
                "message": "Invalid sex information"
            }), 400

        return jsonify({
            "success": True,
            "bmr": round(bmr_value),
            "message": "BMR calculated successfully!"
        }), 200

    except Exception as e:
        print("BMR Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to calculate BMR"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()
