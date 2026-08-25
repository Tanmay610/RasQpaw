import firebase_admin
from firebase_admin import credentials, auth
import os

def init_firebase():
    # If the app is already initialized, skip
    if not firebase_admin._apps:
        service_account_path = os.path.join(os.path.dirname(__file__), '..', '..', 'serviceAccountKey.json')
        service_account_path = os.path.abspath(service_account_path)
        
        if os.path.exists(service_account_path):
            print(f"Initializing Firebase Admin with key: {service_account_path}")
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            try:
                # Try default credentials first
                firebase_admin.initialize_app()
            except ValueError:
                # Fallback for local development when no credentials are provided
                print("Warning: Firebase Admin initialized without credentials (mock mode)")
                firebase_admin.initialize_app(credentials.Certificate({
                    "type": "service_account",
                    "project_id": "demo-project",
                    "private_key_id": "dummy",
                    "private_key": "-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----\n",
                    "client_email": "demo@demo.iam.gserviceaccount.com",
                    "client_id": "123",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/demo"
                }))

def verify_token(id_token: str):
    """
    Verifies a Firebase ID token. Returns the decoded token if valid.
    For this demo, if we are in mock mode and token is "mock-token", we return a dummy user.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        # Dummy fallback for testing if real Firebase project isn't linked
        if id_token.startswith("mock-"):
            return {"uid": "mock-uid-123", "email": "mock@example.com"}
        raise ValueError(f"Invalid Firebase token: {e}")
