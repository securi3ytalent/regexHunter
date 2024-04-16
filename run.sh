#!/bin/bash

cat << "EOF"
____  _____ _____ ________  _ _     _     _      _____  _____ ____ 
/  __\/  __//  __//  __/\  \/// \ /|/ \ /\/ \  /|/__ __\/  __//  __\
|  \/||  \  | |  _|  \   \  / | |_||| | ||| |\ ||  / \  |  \  |  \/|
|    /|  /_ | |_//|  /_  /  \ | | ||| \_/|| | \||  | |  |  /_ |    /
\_/\_\\____\\____\\____\/__/\\\_/ \|\____/\_/  \|  \_/  \____\\_/\_\

EOF

# Text color using ANSI escape codes
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Display other information with color
echo -e "${YELLOW}Author: @SecurityTalent${NC}"
echo -e "${YELLOW}join_us: https://t.me/Securi3yTalent${NC}"

# Function to display usage message
display_usage() {
    echo "Usage: $0 [-h] [-t] [-s] <directory_path> <input_file1> [<input_file2> ...]"
    echo "Options:"
    echo "  -h, --help       Display this help message"
    echo "  -t               Identify the technology used by websites"
    echo "  -s               Find the endpoint sensitive data"
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

# If no arguments provided or an invalid option is used, display usage message
display_usage
exit 1
