import subprocess
import json
import os

def run_lighthouse_audit(url, audit_id):
    # Compute project root and ensure results directory exists
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    results_dir = os.path.join(project_root, 'backend', 'results')
    os.makedirs(results_dir, exist_ok=True)

    result_file = os.path.join(results_dir, f'{audit_id}.json')

    # Resolve the path to the Node audit script
    script_path = os.path.join(project_root, 'auditEngine', 'runLighthouse.js')

    try:
        subprocess.run(
            ['node', script_path, url, result_file],
            check=True,
            cwd=project_root
        )

        # Read JSON with explicit UTF-8 encoding
        with open(result_file, 'r', encoding='utf-8') as f:
            report_json = json.load(f)
        return report_json

    except subprocess.CalledProcessError as e:
        print(f"Lighthouse audit failed: {e}")
        return {'error': str(e)}
    except UnicodeDecodeError as e:
        print(f"Error decoding JSON report: {e}")
        return {'error': 'Failed to parse Lighthouse JSON as UTF-8'}
