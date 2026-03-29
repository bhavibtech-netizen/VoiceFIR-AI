import os
import uuid
import datetime
import json
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__, static_folder='../frontend')
CORS(app)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# Initialize Firebase
# For a hackathon demo, we'll try to find a service account key or use default credentials.
# If no key is found, we can't save to Firestore, but we'll fall back to local JSON logging.
try:
    # Check for service account key in current directory or app directory
    cred_path = os.path.join(os.path.dirname(__file__), 'service-account.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Try default credentials (useful if running in GCP or configured environment)
        firebase_admin.initialize_app()
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Warning: Firebase initialization failed: {e}")
    db = None

@app.route('/save-fir', methods=['POST'])
def save_fir():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Generate unique FIR ID
        year = datetime.datetime.now().year
        unique_id = f"FIR-{year}-{uuid.uuid4().hex[:8].upper()}"
        
        # Add timestamp and ID
        data['fir_id'] = unique_id
        data['timestamp'] = datetime.datetime.now().isoformat()
        data['status'] = 'Under Investigation' # Default status for new FIRs

        if db:
            db.collection('firs').document(unique_id).set(data)
            storage_msg = "Saved to Firestore"
        else:
            # Fallback: log to a local file for demo purposes
            # Ensure UTF-8 encoding for international characters (Hindi, Telugu)
            with open('firs_log.txt', 'a', encoding='utf-8') as f:
                f.write(f"{data['timestamp']} - {unique_id}: {json.dumps(data, ensure_ascii=False)}\n")
            storage_msg = "Logged locally (Firebase not initialized)"

        # --- n8n Webhook Integration ---
        try:
            n8n_url = 'https://rushitha7.app.n8n.cloud/webhook-test/4ed0f6e0-69ca-4fc7-a8aa-58f49ce5ab26'
            # Send the ENTIRE dataset (Incident + Official) to n8n
            n8n_payload = {
                "fir_id": unique_id,
                "timestamp": data.get('timestamp'),
                "priority": data.get('priority', 'Normal'),
                "intent": data.get('intent', 'General'),
                "user": {
                    "name": data.get('user_name'),
                    "email": data.get('user_email'),
                    "phone": data.get('user_phone')
                },
                "incident_details": data,
                "source": "VoiceFIR AI Backend"
            }
            requests.post(n8n_url, json=n8n_payload, timeout=5)
            storage_msg += " & Integrated with n8n"
        except Exception as webhook_err:
            print(f"n8n Webhook Error: {webhook_err}")
            storage_msg += " (n8n link failed)"

        return jsonify({
            "status": "success",
            "fir_id": unique_id,
            "message": f"Your FIR has been generated successfully. {storage_msg}",
            "data": data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-firs', methods=['GET'])
def get_firs():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    firs = []
    try:
        if db:
            docs = db.collection('firs').where('user_email', '==', email).order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
            for doc in docs:
                firs.append(doc.to_dict())
        else:
            if os.path.exists('firs_log.txt'):
                with open('firs_log.txt', 'r', encoding='utf-8') as f:
                    for line in f:
                        if ' - ' in line:
                            try:
                                json_part = line.split(': ', 1)[1].strip()
                                data = json.loads(json_part)
                                if data.get('user_email') == email:
                                    firs.append(data)
                            except:
                                continue
                firs.reverse() # Show newest first
        return jsonify(firs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on port 5000 by default
    app.run(debug=True, port=5000)
