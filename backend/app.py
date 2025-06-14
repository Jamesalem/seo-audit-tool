# backend/app.py
import os
import sys
import json
import logging
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from routes.audit import audit_bp
from routes.report import report_bp
from routes.interpret import interpret_bp

load_dotenv()

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "time":     self.formatTime(record),
            "level":    record.levelname,
            "message":  record.getMessage(),
            "module":   record.module,
            "funcName": record.funcName,
            "lineNo":   record.lineno
        }
        return json.dumps(log)

def create_app():
    # Initialize Flask
    app = Flask(__name__, instance_relative_config=False)

    # Basic config
    app.config.update(
        JSONIFY_PRETTYPRINT_REGULAR=False,
        DEBUG=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY", "replace-this-with-a-secure-key")
    )

    # CORS
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:3000",
        "chrome-extension://*"
    ]}})

    # Structured JSON logging
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    # Clear default handlers and install ours
    app.logger.handlers = [handler]
    app.logger.setLevel(logging.DEBUG if app.debug else logging.INFO)
    app.logger.info("Starting SEO Audit Tool backend")

    # Register API blueprints
    app.register_blueprint(audit_bp,     url_prefix="/api")
    app.register_blueprint(report_bp,    url_prefix="/api")
    app.register_blueprint(interpret_bp, url_prefix="/api")

    # Health-check endpoint
    @app.route("/healthz", methods=["GET"])
    def healthz():
        return jsonify(status="ok"), 200

    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(err):
        app.logger.error(f"Unhandled Exception: {err}", exc_info=True)
        return jsonify(error="Internal server error"), 500

    return app

if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=flask_app.config["DEBUG"],
        threaded=True,
        use_reloader=flask_app.config["DEBUG"]
    )
