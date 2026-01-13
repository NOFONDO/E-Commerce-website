from LogParser import parse_failed_logins
from detection_rule import is_suspicious

LOG_FILE = "server.log"

# Parse log file
ip_counts = parse_failed_logins(LOG_FILE)

# Filter suspicious IPs (>=5 failed attempts)
suspicious_ips = {
    ip: count
    for ip, count in ip_counts.items()
    if is_suspicious(count)
}

# Build HTML report
html = """<!DOCTYPE html>
<html>
<head>
    <title>Suspicious IP Report</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f4f6f8;
            padding: 40px;
        }

        .container {
            max-width: 700px;
            margin: auto;
            background: white;
            padding: 25px;
            border-radius: 6px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }

        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background-color: #2f80ed;
            color: white;
            padding: 10px;
            text-align: left;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }

        tr:hover {
            background-color: #f1f1f1;
        }

        .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>

    <div class="container">
        <h2>🚨 Suspicious IP Address Report</h2>

        <table>
            <tr>
                <th>IP Address</th>
                <th>Failed Login Attempts</th>
            </tr>
"""


for ip, count in suspicious_ips.items():
    html += f"""
            <tr>
                <td>{ip}</td>
                <td>{count}</td>
            </tr>
    """

html += """
        </table>

        <div class="footer">
            Generated automatically from server log analysis
        </div>
    </div>

</body>
</html>
"""

with open("LogResult.html", "w", encoding="utf-8") as file:
    file.write(html)

print("✅ HTML report generated: LogResult.html")