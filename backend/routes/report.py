# backend/routes/report.py
from flask import Blueprint, send_file, current_app, jsonify
import os
import json
from services.pdf_service import generate_pdf_report

report_bp = Blueprint('report', __name__, url_prefix='/api')

# Helper to get the paths for a given report_id
def _paths_for(report_id):
    base = os.path.join(current_app.root_path, 'results')
    return {
        'dir': base,
        'json': os.path.join(base, f"{report_id}.json"),
        'pdf':  os.path.join(base, f"{report_id}.pdf")
    }

@report_bp.route('/report/<report_id>', methods=['GET'])
def get_report_json(report_id):
    """
    Return the stored JSON for a report. 404 if missing.
    """
    paths = _paths_for(report_id)
    if not os.path.isfile(paths['json']):
        current_app.logger.warning(f"JSON not found for report {report_id}")
        return jsonify({"error": "Report not found"}), 404

    with open(paths['json'], 'r', encoding='utf-8') as f:
        data = json.load(f)

    return jsonify(data), 200

@report_bp.route('/report/<report_id>/pdf', methods=['GET'])
def get_report_pdf(report_id):
    """
    Serve the PDF for a report, generating it on the fly if needed.
    Falls back to JSON 404 if the audit never ran, or returns 500 on PDF generation failure.
    """
    paths = _paths_for(report_id)

    # 1) Ensure audit JSON exists
    if not os.path.isfile(paths['json']):
        current_app.logger.error(f"Audit data not found for {report_id}: {paths['json']}")
        return jsonify({"error": "Report data not found"}), 404

    # 2) Generate PDF if missing
    if not os.path.isfile(paths['pdf']):
        current_app.logger.info(f"PDF not found for {report_id}; generating...")
        with open(paths['json'], 'r', encoding='utf-8') as f:
            report_data = json.load(f)

        pdf_path = generate_pdf_report(report_data, report_id)
        if not pdf_path or not os.path.isfile(pdf_path):
            current_app.logger.error(f"PDF generation failed for {report_id}")
            return jsonify({"error": "Failed to generate report"}), 500

    # 3) Serve the PDF
    return send_file(
        paths['pdf'],
        as_attachment=True,
        download_name=f"seo-audit-report-{report_id}.pdf",
        mimetype='application/pdf'
    )
