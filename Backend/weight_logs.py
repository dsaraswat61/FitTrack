
from flask import Blueprint, request, jsonify
from database import get_connection
from datetime import date

weight_logs = Blueprint("weight_logs", __name__)


# ADD WEIGHT RECORD
@weight_logs.route("/api/weight", methods=["POST"])
def add_weight():

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    weight = data.get("weight")
    log_date = data.get("date")

    if not user_id or weight is None:
        return jsonify({
            "success": False,
            "message": "User ID and weight are required"
        }), 400

    try:
        weight = float(weight)

        if weight <= 0:
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Please enter a valid weight"
        }), 400

    if not log_date:
        log_date = date.today()

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO weight_logs (user_id, weight, log_date)
            VALUES (%s, %s, %s)
        """, (user_id, weight, log_date))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Weight recorded successfully!",
            "weight_id": cursor.lastrowid
        }), 201

    except Exception as e:
        print("Add Weight Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to record weight"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# GET WEIGHT HISTORY
@weight_logs.route("/api/weight/<int:user_id>", methods=["GET"])
def get_weight_history(user_id):

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, weight, log_date AS date
            FROM weight_logs
            WHERE user_id = %s
            ORDER BY log_date DESC, id DESC
        """, (user_id,))

        records = cursor.fetchall()

        for record in records:
            if record["date"]:
                record["date"] = record["date"].isoformat()

        return jsonify({
            "success": True,
            "records": records
        }), 200

    except Exception as e:
        print("Get Weight Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch weight history"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# DELETE WEIGHT RECORD
@weight_logs.route("/api/weight/<int:record_id>", methods=["DELETE"])
def delete_weight(record_id):

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
            DELETE FROM weight_logs
            WHERE id = %s AND user_id = %s
        """, (record_id, user_id))

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Weight record not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Weight record deleted successfully!"
        }), 200

    except Exception as e:
        print("Delete Weight Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to delete weight record"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()
