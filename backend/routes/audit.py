from flask import Blueprint, request, jsonify, current_app
import logging
import uuid
import os
import json
from services.lighthouse_service import run_lighthouse_audit

audit_bp = Blueprint('audit', __name__, url_prefix='/api')

@audit_bp.route('/audit', methods=['POST'])
def run_audit():
    data = request.get_json() or {}
    url = data.get('url')
    logging.info(f"Received audit request for URL: {url}")
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    # Generate a unique report ID
    report_id = str(uuid.uuid4())

    # Run Lighthouse audit
    report_data = run_lighthouse_audit(url, report_id)
    logging.info(f"run_lighthouse_audit returned keys: {list(report_data.keys())}")
    if 'error' in report_data:
        return jsonify({'error': 'Audit failed'}), 500

    # Save full JSON to backend/results/<report_id>.json
    results_dir = os.path.join(current_app.root_path, 'results')
    os.makedirs(results_dir, exist_ok=True)
    json_path = os.path.join(results_dir, f"{report_id}.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    # Return just the ID and the slices the frontend needs
    return jsonify({
        'report_id': report_id,
        'categories': report_data.get('categories', {}),
        'audits': report_data.get('audits', {})
    }), 200
