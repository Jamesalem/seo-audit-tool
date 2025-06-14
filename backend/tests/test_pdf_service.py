import os
import json
from services.pdf_service import generate_pdf_report

def test_generate_pdf_report(tmp_path, monkeypatch):
    # Create dummy report_data
    rd = {"categories":{}, "audits":{}}
    rid = "test123"
    # monkeypatch node call to just touch the PDF
    def fake_run(cmd, cwd, check, capture_output, text):
        pdf = tmp_path / 'backend' / 'results' / f'{rid}.pdf'
        pdf.parent.mkdir(parents=True, exist_ok=True)
        pdf.write_bytes(b'%PDF-1.4\n%EOF')
        class R: stdout=""; returncode=0
        return R()
    monkeypatch.setattr('subprocess.run', fake_run)
    # call service
    pdf_path = generate_pdf_report(rd, rid)
    assert os.path.exists(pdf_path)
