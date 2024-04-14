import fetch from 'node-fetch';
import fs from 'fs';

// Set environment variable to bypass SSL certificate verification
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Define sensitive data patterns
const specifics = {
    "Slack Token": "(xox[pboa]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})",
    "RSA private key": "-----BEGIN RSA PRIVATE KEY-----",
    "SSH (DSA) private key": "-----BEGIN DSA PRIVATE KEY-----",
    "SSH (EC) private key": "-----BEGIN EC PRIVATE KEY-----",
    "PGP private key block": "-----BEGIN PGP PRIVATE KEY BLOCK-----",
    "Amazon MWS Auth Token": "amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    "AWS AppSync GraphQL Key": "da2-[a-z0-9]{26}",
    "Facebook Access Token": "EAACEdEose0cBA[0-9A-Za-z]+",
    "Facebook OAuth": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}['|\"][0-9a-f]{32}['|\"]",
    "GitHub": "[gG][iI][tT][hH][uU][bB].{0,20}['|\"][0-9a-zA-Z]{35,40}['|\"]",
    "Google (GCP) Service-account": "\"type\": \"service_account\"",
    "Heroku API Key": "[hH][eE][rR][oO][kK][uU].{0,20}[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}",
    "Json Web Token" : "eyJhbGciOiJ",
    "MailChimp API Key": "[0-9a-f]{32}-us[0-9]{1,2}",
    "Mailgun API Key": "key-[0-9a-zA-Z]{32}",
    "Password in URL": "[a-zA-Z]{3,10}://[^/\\s:@]{3,20}:[^/\\s:@]{3,20}@.{1,100}[\"'\\s]",
    "PayPal Braintree Access Token": "access_token\\$production\\$[0-9a-z]{16}\\$[0-9a-f]{32}",
    "Picatic API Key": "sk_live_[0-9a-z]{32}",
    "Slack Webhook": "https://hooks\\.slack\\.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}",
    "Stripe API Key": "sk_live_[0-9a-zA-Z]{24}",
    "Stripe Restricted API Key": "rk_live_[0-9a-zA-Z]{24}",
    "Square Access Token": "sq0atp-[0-9A-Za-z\\-_]{22}",
    "Square OAuth Secret": "sq0csp-[0-9A-Za-z\\-_]{43}",
    "Telegram Bot API Key": "[0-9]+:AA[0-9A-Za-z\\-_]{33}",
    "Twilio API Key": "SK[0-9a-fA-F]{32}",
    "Github Auth Creds": "https:\/\/[a-zA-Z0-9]{40}@github\.com",
    "Google API Key": "AIza[0-9A-Za-z\\-_]{35}",
    "Google Cloud Platform API Key": "AIza[0-9A-Za-z\\-_]{35}",
    "Google Cloud Platform OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com",
    "Google Drive API Key": "AIza[0-9A-Za-z\\-_]{35}",
    "Google Drive OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com",
    "Google Gmail API Key": "AIza[0-9A-Za-z\\-_]{35}",
    "Google Gmail OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com",
    "Google OAuth Access Token": "ya29\\.[0-9A-Za-z\\-_]+",
    "Google YouTube API Key": "AIza[0-9A-Za-z\\-_]{35}",
    "Google YouTube OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com",
    "Twitter Access Token": "[tT][wW][iI][tT][tT][eE][rR].*[1-9][0-9]+-[0-9a-zA-Z]{40}",
    "Twitter OAuth": "[tT][wW][iI][tT][tT][eE][rR].*['|\"][0-9a-zA-Z]{35,44}['|\"]",
};

const generics = {
    "Generic API Key": "[aA][pP][iI]_?[kK][eE][yY].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic Secret": "[sS][eE][cC][rR][eE][tT].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
};

const aws = {
    "AWS API Key": "((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})",
};

const passwordPatterns = {
    "password": /password\s*=\s*([^\s&]+)/i,
    "pass": /pass\s*=\s*([^\s&]+)/i,
    "pwd": /pwd\s*=\s*([^\s&]+)/i,
    "username": /user(?:name)?\s*=\s*([^\s&]+)/i,
    "email": /email\s*=\s*([^\s&]+)/i,
    "userid": /user(?:id)?\s*=\s*([^\s&]+)/i,
    "login": /login\s*=\s*([^\s&]+)/i,
    "passwd": /passwd\s*=\s*([^\s&]+)/i,
};

const denyList = ["AIDAAAAAAAAAAAAAAAAA"];

// Function to check data against patterns
function checkData(data, src, regexes, fromEncoded = false, parentUrl, parentOrigin) {
    const findings = [];
    for (const key in regexes) {
        const re = new RegExp(regexes[key]);
        let match = re.exec(data);
        if (Array.isArray(match)) { match = match.toString(); }
        if (denyList.includes(match)) {
            continue;
        }
        if (match) {
            const finding = {
                src: src,
                match: match,
                key: key,
                encoded: fromEncoded,
                parentUrl: parentUrl,
            };
            findings.push(finding);
        }
    }
    return findings;
}

// Function to fetch website content and check for sensitive data
function fetchWebsiteContent(url, fromEncoded = false) {
    const finalUrl = fromEncoded ? decodeURIComponent(url) : url;
    fetch(finalUrl)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Error fetching web page content: ${url} returned a 404 (Not Found) error`);
                } else {
                    throw new Error(`Error fetching web page content: ${response.status} ${response.statusText}`);
                }
            }
            return response.text();
        })
        .then(html => {
            // Check for sensitive data in the fetched HTML
            const specificsFindings = checkData(html, url, specifics, fromEncoded);
            const genericsFindings = checkData(html, url, generics, fromEncoded);
            const awsFindings = checkData(html, url, aws, fromEncoded);
            const passwordFindings = checkData(html, url, passwordPatterns, fromEncoded);

            // Combine all findings
            const allFindings = [...specificsFindings, ...genericsFindings, ...awsFindings, ...passwordFindings];

            // Show results if sensitive data found
            if (allFindings.length > 0) {
                console.log("Sensitive data found:", allFindings);
            }
        })
        .catch(error => console.error(error.message));
}

// Function to read website URLs from file and process each URL
function processWebsiteList(filename) {
    // Read the website URLs from the file
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }

        // Split the data into an array of URLs
        const urls = data.split('\n');

        // Process each URL
        urls.forEach(url => {
            if (url.trim() !== '') {
                fetchWebsiteContent(url.trim());
            }
        });
    });
}

// Start by reading the filename containing website URLs from user input
const filename = 'domainlist.txt'; // Assuming the filename is fixed
processWebsiteList(filename);


