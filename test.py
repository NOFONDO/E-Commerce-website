# test_system.py

from parser import parse_failed_logins
from detection import is_suspicious, flag_suspicious_ips

def test_detection_rule_true():
    assert is_suspicious(5) == True

def test_detection_rule_false():
    assert is_suspicious(3) == False

def test_parser_counts_correctly():
    ip_counts = parse_failed_logins("server.log")
    assert ip_counts["192.168.1.10"] == 5

def test_flagging_detects_ip():
    ip_counts = {"1.1.1.1": 6}
    flagged = flag_suspicious_ips(ip_counts)
    assert "1.1.1.1" in flagged

def test_flagging_ignores_safe_ip():
    ip_counts = {"2.2.2.2": 2}
    flagged = flag_suspicious_ips(ip_counts)
    assert "2.2.2.2" not in flagged

print("✅ All unit tests passed")
