from flask import Blueprint, request, jsonify
from database import get_connection
from datetime import date


workouts = Blueprint("workouts", __name__)


# Add a new workout
@workouts.route("/api/workouts", methods=["POST"])
def add_workout():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    exercise_name = data.get("name", "").strip()
    duration = data.get("duration")
    workout_date = data.get("date")
    notes = data.get("notes", "")

    if not user_id or not exercise_name or not duration:
        return jsonify({
            "success": False,
            "message": "User ID, exercise name and duration are required"
        }), 400

    try:
        duration = int(duration)

        if duration <= 0:
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Duration must be a positive number"
        }), 400

    if not workout_date:
        workout_date = date.today()

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO workouts
            (user_id, exercise_name, duration, workout_date, notes)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, exercise_name, duration, workout_date, notes))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Workout added successfully!",
            "workout_id": cursor.lastrowid
        }), 201

    except Exception as e:
        print("Add workout error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to add workout"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Get workouts of a user
@workouts.route("/api/workouts/<int:user_id>", methods=["GET"])
def get_workouts(user_id):

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, exercise_name AS name, duration,
                   workout_date AS date, notes
            FROM workouts
            WHERE user_id = %s
            ORDER BY workout_date DESC, id DESC
        """, (user_id,))

        records = cursor.fetchall()

        for record in records:
            if record["date"]:
                record["date"] = record["date"].isoformat()

        return jsonify({
            "success": True,
            "workouts": records
        }), 200

    except Exception as e:
        print("Get workouts error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch workouts"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Delete a workout
@workouts.route("/api/workouts/<int:workout_id>", methods=["DELETE"])
def delete_workout(workout_id):

    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "User ID is required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            DELETE FROM workouts
            WHERE id = %s AND user_id = %s
        """, (workout_id, user_id))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Workout not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Workout deleted successfully!"
        }), 200

    except Exception as e:
        print("Delete workout error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to delete workout"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()