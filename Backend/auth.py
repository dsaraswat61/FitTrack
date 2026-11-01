
from flask import Blueprint, request, jsonify
from database import get_connection
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint("auth", __name__)


# =====================================
# USER REGISTRATION
# =====================================

@auth.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    age = data.get("age")
    height = data.get("height")
    weight = data.get("weight")
    sex = data.get("sex", "").strip().lower()

    if not all([name, email, password, age, height, weight, sex]):
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters"
        }), 400

    try:
        age = int(age)
        height = float(height)
        weight = float(weight)

        if age <= 0 or height <= 0 or weight <= 0:
            raise ValueError()

        if sex not in ("male", "female"):
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Please enter valid age, height, weight and sex"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Email already registered"
            }), 409

        hashed_password = generate_password_hash(password)

        cursor.execute("""
            INSERT INTO users
            (name, email, password, age, height, weight, sex)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, email, hashed_password, age, height, weight, sex))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "user_id": cursor.lastrowid
        }), 201

    except Exception as e:
        print("Registration error:", e)

        return jsonify({
            "success": False,
            "message": "Something went wrong"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# =====================================
# USER LOGIN
# =====================================

@auth.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT id, name, email, password
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user or not check_password_hash(user[3], password):
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful!",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }), 200

    except Exception as e:
        print("Login error:", e)

        return jsonify({
            "success": False,
            "message": "Something went wrong"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# =====================================
# GET USER PROFILE
# =====================================

@auth.route("/api/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, email, age, height, weight, sex
            FROM users
            WHERE id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "user": user
        }), 200

    except Exception as e:
        print("Get Profile Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to fetch profile"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# =====================================
# UPDATE USER PROFILE
# =====================================

@auth.route("/api/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    age = data.get("age")
    height = data.get("height")
    weight = data.get("weight")
    sex = data.get("sex", "").strip().lower()

    if not all([name, email, age, height, weight, sex]):
        return jsonify({
            "success": False,
            "message": "All profile fields are required"
        }), 400

    if "@" not in email or "." not in email:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address"
        }), 400

    try:
        age = int(age)
        height = float(height)
        weight = float(weight)

        if age <= 0 or height <= 0 or weight <= 0:
            raise ValueError()

        if sex not in ("male", "female"):
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Please enter valid fitness details"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Check whether the user exists
        cursor.execute(
            "SELECT id FROM users WHERE id = %s",
            (user_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Check whether another user uses this email
        cursor.execute("""
            SELECT id FROM users
            WHERE email = %s AND id != %s
        """, (email, user_id))

        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "This email is already registered"
            }), 409

        # Update profile
        cursor.execute("""
            UPDATE users
            SET name = %s,
                email = %s,
                age = %s,
                height = %s,
                weight = %s,
                sex = %s
            WHERE id = %s
        """, (name, email, age, height, weight, sex, user_id))

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Profile updated successfully!",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "age": age,
                "height": height,
                "weight": weight,
                "sex": sex
            }
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print("Update Profile Error:", e)

        return jsonify({
            "success": False,
            "message": "Unable to update profile"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()
