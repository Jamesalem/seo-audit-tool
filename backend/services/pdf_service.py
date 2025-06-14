import subprocess
import os
import json
from flask import current_app

def generate_pdf_report(report_data, report_id):
    """
    Writes report_data to <root>/backend/results/<report_id>.json,
    then invokes auditEngine/generatePdf.js to create the PDF.
    Returns the full pdf_path or None on failure.
    """
    # ─── 1) Compute project_root ──────────────────────────────────────────
    # __file__ is .../seo-audit-tool/backend/services/pdf_service.py
    project_root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), '..', '..')
    )  # → .../seo-audit-tool

    # ─── 2) Prepare results directory ────────────────────────────────────
    results_dir = os.path.join(project_root, 'backend', 'results')
    os.makedirs(results_dir, exist_ok=True)

    # ─── 3) Write JSON for Puppeteer ────────────────────────────────────
    json_path = os.path.join(results_dir, f'{report_id}.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    # ─── 4) Invoke generatePdf.js ───────────────────────────────────────
    pdf_path = os.path.join(results_dir, f'{report_id}.pdf')
    script_path = os.path.join(project_root, 'auditEngine', 'generatePdf.js')

    try:
        result = subprocess.run(
            ['node', script_path, report_id, pdf_path],
            cwd=project_root,
            check=True,
            capture_output=True,
            text=True
        )
        current_app.logger.info(f"Puppeteer stdout:\n{result.stdout}")
        return pdf_path

    except subprocess.CalledProcessError as e:
        current_app.logger.error(
            f"PDF generation failed (exit {e.returncode}):\n{e.stderr}"
        )
        return None
