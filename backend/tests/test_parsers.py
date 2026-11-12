import io
import json
import csv
import zipfile
import xml.etree.ElementTree as ET
from app.services.ingestion.parser import DocumentParserService

def test_chunk_text():
    sample = "Paragraph 1 is about architecture.\n\nParagraph 2 is about database design.\n\nParagraph 3 is about deployment."
    chunks = DocumentParserService.chunk_text(sample, chunk_size=50, overlap=10)
    assert len(chunks) > 0
    for ch in chunks:
        assert "text_content" in ch
        assert "start_offset" in ch
        assert "end_offset" in ch

def test_parse_csv():
    csv_data = "name,role,department\nAlice,Architect,Core\nBob,Lead,Infra\nCharlie,Engineer,Security"
    full_text, chunks = DocumentParserService.parse_csv(csv_data.encode("utf-8"))
    assert "Tabular Dataset Schema" in full_text
    assert "Alice" in full_text
    assert "Infra" in full_text
    assert len(chunks) > 0

def test_parse_json():
    obj = {"system": "BATON", "version": "2.0", "modules": ["radar", "ledger", "bridge"]}
    raw_bytes = json.dumps(obj).encode("utf-8")
    full_text, chunks = DocumentParserService.parse_json(raw_bytes)
    assert "Structured JSON Data Specification" in full_text
    assert "modules" in full_text
    assert len(chunks) > 0

def test_parse_docx():
    # Build minimal in-memory docx zip
    docx_buffer = io.BytesIO()
    with zipfile.ZipFile(docx_buffer, "w") as z:
        xml_content = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:body>
                <w:p><w:r><w:t>Production Deployment Runbook for BATON Platform.</w:t></w:r></w:p>
                <w:p><w:r><w:t>Step 1: Check database migrations and pgvector extension.</w:t></w:r></w:p>
            </w:body>
        </w:document>"""
        z.writestr("word/document.xml", xml_content)
    docx_bytes = docx_buffer.getvalue()

    full_text, chunks = DocumentParserService.parse_docx(docx_bytes)
    assert "Production Deployment Runbook" in full_text
    assert "Step 1" in full_text
    assert len(chunks) > 0
