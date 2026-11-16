import html
import re
import subprocess
import os

md_path = os.path.join(os.path.dirname(__file__), 'ROUND_3_FINAL_PRODUCT.md')
html_path = os.path.join(os.path.dirname(__file__), 'ROUND_3_FINAL_PRODUCT.html')
pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'BATON_Round_3_Final_Product.pdf'))

with open(md_path, 'r', encoding='utf-8') as f:
    text = f.read()

html_body = []
in_code = False
code_buf = []

for line in text.split('\n'):
    if line.startswith('```'):
        if in_code:
            html_body.append('<pre style="background:#0f172a;color:#f8fafc;padding:12px;border-radius:8px;font-size:11.5px;overflow-x:auto;"><code>' + html.escape('\n'.join(code_buf)) + '</code></pre>')
            code_buf = []
            in_code = False
        else:
            in_code = True
        continue
    if in_code:
        code_buf.append(line)
        continue

    line_s = line.strip()
    if line_s.startswith('# '):
        html_body.append(f'<h1 style="color:#0f172a;border-bottom:2px solid #0284c7;padding-bottom:8px;margin-top:28px;font-size:22px;">{html.escape(line_s[2:])}</h1>')
    elif line_s.startswith('## '):
        html_body.append(f'<h2 style="color:#0369a1;margin-top:22px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;font-size:17px;">{html.escape(line_s[3:])}</h2>')
    elif line_s.startswith('### '):
        html_body.append(f'<h3 style="color:#0f172a;margin-top:16px;font-size:14px;">{html.escape(line_s[4:])}</h3>')
    elif line_s.startswith('#### '):
        html_body.append(f'<h4 style="color:#334155;margin-top:12px;font-size:13px;">{html.escape(line_s[5:])}</h4>')
    elif line_s.startswith('* ') or line_s.startswith('- '):
        bold_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html.escape(line_s[2:]))
        html_body.append(f'<li style="margin-bottom:4px;color:#334155;">{bold_formatted}</li>')
    elif re.match(r'^\d+\.\s', line_s):
        content = re.sub(r'^\d+\.\s', '', line_s)
        bold_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html.escape(content))
        html_body.append(f'<li style="margin-bottom:5px;color:#334155;">{bold_formatted}</li>')
    elif line_s.startswith('> '):
        html_body.append(f'<blockquote style="border-left:4px solid #0284c7;margin:12px 0;padding:8px 16px;background:#f0f9ff;color:#0369a1;font-style:italic;">{html.escape(line_s[2:])}</blockquote>')
    elif line_s == '':
        html_body.append('<div style="height:6px;"></div>')
    else:
        bold_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html.escape(line))
        bold_formatted = re.sub(r'`(.*?)`', r'<code style="background:#f1f5f9;color:#0f172a;padding:2px 5px;border-radius:4px;font-size:11.5px;">\1</code>', bold_formatted)
        html_body.append(f'<p style="color:#334155;line-height:1.55;margin:4px 0;">{bold_formatted}</p>')

full_html = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>BATON - Round 3 Final Product</title>
<style>
body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    max-width: 850px;
    margin: 30px auto;
    padding: 0 24px;
    background: #ffffff;
    font-size: 13px;
}}
@page {{ margin: 16mm 14mm 16mm 14mm; }}
li {{ line-height: 1.5; }}
</style>
</head>
<body>
<div style="background:linear-gradient(135deg, #0f172a, #1e293b);color:white;padding:22px;border-radius:10px;margin-bottom:20px;">
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <div>
      <h1 style="margin:0;font-size:24px;color:#38bdf8;">BATON</h1>
      <p style="margin:3px 0 0 0;color:#94a3b8;font-size:12.5px;">AI Knowledge Continuity Platform &bull; Round 3 Final Product Dossier</p>
    </div>
    <div style="text-align:right;">
      <div style="background:#0284c7;color:white;font-weight:bold;padding:4px 10px;border-radius:6px;font-size:11px;display:inline-block;">CodersInPune 2026</div>
      <p style="margin:5px 0 0 0;color:#cbd5e1;font-size:12px;">Team: <strong>BATON</strong> | Lead: <strong>Rohit Dhangar</strong></p>
    </div>
  </div>
</div>
{''.join(html_body)}
</body>
</html>'''

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
cmd = [chrome_path, '--headless', '--disable-gpu', f'--print-to-pdf={pdf_path}', os.path.abspath(html_path)]
subprocess.run(cmd, check=True)
print('PDF generated successfully at:', pdf_path)

