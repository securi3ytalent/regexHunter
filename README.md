
# regexHunter

regex Hunter- Fast website endpoint sensitive data scraper

The tool in question was created in javascript (node js), python and shell scripting and its main objective is to search for sensitive data and API keys in JavaScript files and HTML pages.

## Screenshots

![App Screenshot](https://github.com/securi3ytalent/regexHunter/blob/main/assets/regex%20hunter%20tools%20screenshots.png?raw=true)


## File Tracture

One Directory after there must be a list of website file need.

```bash
  ├── gospider_domain_list
└── regexHunter(tols)
    ├── package.json
    ├── package-lock.json
    ├── run.sh
    └── tools.js

```


## Features

- Super Faster



## Requirement
- node js
- python


## Deployment

Fast need clone the repo
```bash
git clone https://github.com/securi3ytalent/regexHunter.git
```

```bash
cd regexHunter
```
Dependency install
```bash
npm i
```

sorting the url's
```bash
./run.sh < gospider_list_file  >
```
Find the endpoint sensitive data and API
```bash
./run.sh -s
```
Identify the technology used by websites
```bash
./run.sh -t
```
Convert domains to IP addresses
```bash
./run.sh -i
```

