# detection.py

THRESHOLD = 5

def is_suspicious(attempts):
    return attempts >= THRESHOLD


def flag_suspicious_ips(ip_counts):
    """
    Filters and returns only suspicious IPs
    """
    return {
        ip: count
        for ip, count in ip_counts.items()
        if is_suspicious(count)
    }
