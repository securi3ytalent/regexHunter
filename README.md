
# regexHunter

regex Hunter- Fast website endpoint sensitive data scraper


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
Identify the technology used by websites
```bash
./run.sh -t
```
Find the endpoint sensitive data
```bash
./run.sh -s
```
