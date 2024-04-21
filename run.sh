#!/bin/bash


cat << "EOF"
 (                       )                          
 )\ )                 ( /(               )          
(()/((  (    (    )   )\())  (        ( /(  (  (    
 /(_))\))(  ))\( /(  ((_)\  ))\  (    )\())))\ )(   
(_))((_))\ /((_)\())  _((_)/((_) )\ )(_))//((_|()\  
| _ \(()(_|_))((_)\  | || (_))( _(_/(| |_(_))  ((_) 
|   / _` |/ -_) \ /  | __ | || | ' \))  _/ -_)| '_| 
|_|_\__, |\___/_\_\  |_||_|\_,_|_||_| \__\___||_|   
    |___/                                           


EOF

# Text color using ANSI escape codes
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Display other information with color
echo -e "${YELLOW}Author: @SecurityTalent${NC}"
echo -e "${YELLOW}join_us: https://t.me/Securi3yTalent${NC}"
echo " "


# Function to display usage message
display_usage() {
    echo "Usage: $0 <input_file1> [<input_file2> ...] ** Fast need to sorting url's"
    echo "Usage: $0 [-h] [-t] [-s] [-i]      example:  run.sh -t | run.sh -s | run.sh -i"
    echo ""
    echo "Options:"
    echo "  -h, --help       Display this help message"
    echo "  -t               Identify the technology used by websites"
    echo "  -s               Find the endpoint sensitive data"
    echo "  -i               Convert domains to IP addresses and save to file"
}

# Check if the script was called with the -h argument
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    display_usage
    exit 0
fi

# Check if the script was called with the -t argument
if [[ "$1" == "-t" ]]; then
    # Shift the arguments to remove the -t option
    shift
    # Python code to identify the technology used by websites
    python3 <<END
import builtwith

def get_technology(url):
    # Get technologies used by the given URL
    technologies = builtwith.parse(url)
    
    # Output the technologies detected
    print(f"Technologies used by {url}:")
    for category, technology in technologies.items():
        print(f"{category}:")
        for tech in technology:
            print(f"- {tech}")
    print("\n")

def main():
    # Read URLs from domainlist.txt
    with open("domainlist.txt", "r") as file:
        urls = file.readlines()
    
    # Remove whitespace characters like `\n` at the end of each line
    urls = [url.strip() for url in urls]
    
    # Process each URL
    for url in urls:
        get_technology(url)

if __name__ == "__main__":
    main()
END
    exit 0
fi

# Check if the script was called with the -s argument
if [[ "$1" == "-s" ]]; then
    # Shift the arguments to remove the -s option
    shift
    # Run the Node.js script tools.js
    node tools.js
    exit 0
fi

# Check if the script was called with the -i argument
if [[ "$1" == "-i" ]]; then
    # Shift the arguments to remove the -i option
    shift
    # Python code to convert domains to IP addresses and save to file
    python3 <<END
import socket
from urllib.parse import urlparse

def get_domain_from_url(url):
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    return domain

def get_ip_from_domain(domain):
    try:
        ip_address = socket.gethostbyname(domain)
        return ip_address
    except socket.gaierror:
        return None

def main():
    file_path = "domainlist.txt"
    unique_ips = set()

    with open(file_path, "r") as file:
        urls = file.readlines()
    
    with open("IP_list.txt", "w") as ip_file:
        for url in urls:
            url = url.strip()  # Remove leading/trailing whitespace and newline characters
            domain = get_domain_from_url(url)
            ip_address = get_ip_from_domain(domain)
            if ip_address and ip_address not in unique_ips:
                unique_ips.add(ip_address)
                print(ip_address)
                ip_file.write(ip_address + "\n")

if __name__ == "__main__":
    main()
END
    exit 0
fi

# Parent directory path
parent_directory="../"

# If no input file names are provided, select all .txt files in the parent directory
if [ "$#" -eq 0 ]; then
    input_files=("$parent_directory"*.txt)
else
    input_files=("$@")
fi

# Extract only the URLs and remove lines containing the specified pattern
extract_urls() {
    grep -h -Eo 'https?://[^[:space:]]+' "$@" | grep -v '\[linkfinder\] - \[' | sort | uniq > "domainlist.txt"
}

# Iterate through input files in the parent directory and call extract_urls function for each file
for input_file in "${input_files[@]}"; do
    extract_urls "$parent_directory$input_file"
    echo "URLs extracted from $input_file and saved to domainlist.txt"
done
