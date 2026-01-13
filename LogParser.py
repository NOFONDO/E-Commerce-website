import re
from regex_rule import FAILED_LOGIN_REGEX

def parse_failed_logins(log_file):
    ip_counts = {}
    pattern = re.compile(FAILED_LOGIN_REGEX)

    with open(log_file, "r") as file:
        for line in file:
            match = pattern.search(line)
            if match:
                ip = match.group("ip")
                ip_counts[ip] = ip_counts.get(ip, 0) + 1

    return ip_counts
