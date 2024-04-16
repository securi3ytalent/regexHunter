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
    echo "Usage: $0 <directory_path> <input_file1> [<input_file2> ...]"
    #./run.sh ../ input_file_name
}

# Check if the script was called with the -h argument
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    display_usage
    exit 0
fi

# Check if at least two arguments are provided
if [ "$#" -lt 2 ]; then
    display_usage
    exit 1
fi

# Directory path
directory_path="$1"

# Shift the arguments to remove the directory path
shift

# Number of input files
num_input_files=$(($#))

# Input file names
input_files=("$@")

# Extract only the URLs and remove lines containing the specified pattern
extract_urls() {
    grep -h -Eo 'https?://[^[:space:]]+' "$@" | grep -v '\[linkfinder\] - \[' | sort | uniq > "domainlist.txt"
}

# Iterate through input files in the directory and call extract_urls function for each file
for input_file in "${input_files[@]}"; do
    extract_urls "$directory_path/$input_file"
    echo "URLs extracted from $input_file and saved to domainlist.txt"
done

# Run the Node.js script tools.js
node tools.js
