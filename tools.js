import fetch from 'node-fetch';
import fs from 'fs';


// Set environment variable to bypass SSL certificate verification
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Define sensitive data patterns
const specifics = {
    "Slack Token": "(xox[pboa]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})",
    "Slack Webhook": "https://hooks.slack.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}",
    "Stripe API Key": "sk_live_[0-9a-zA-Z]{24}",
    "RSA private key": "-----BEGIN RSA PRIVATE KEY-----",
    "SSH (DSA) private key": "-----BEGIN DSA PRIVATE KEY-----",
    "SSH (EC) private key": "-----BEGIN EC PRIVATE KEY-----",
    "PGP private key block": "-----BEGIN PGP PRIVATE KEY BLOCK-----",
    "Amazon MWS Auth Token": "amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    "Google Cloud Platform Service Account": "([0-9]+-[0-9a-zA-Z]{32}@[0-9a-zA-Z]{38})",
    "Google Cloud Platform Service Account 2": "([0-9]+-[0-9a-zA-Z]{32}@[0-9a-zA-Z]{32}.apps.googleusercontent.com)",
    "Google Cloud Platform Service Account 3": "([0-9]+-[0-9a-zA-Z]{32}@[0-9a-zA-Z]{32}.iam.gserviceaccount.com)",
    "Google Cloud Platform Service Account 4": "([0-9]+-[0-9a-zA-Z]{32}@[0-9a-zA-Z]{32}-gcp-sa.iam.gserviceaccount.com)",
    "Google Cloud Platform Service Account 6": "([0-9]+-[0-9a-zA-Z]{32}@[0-9a-zA-Z]{32}.gserviceaccount.com)",
    "AWS AppSync GraphQL Key": "da2-[a-z0-9]{26}",
    "Facebook Access Token": "EAACEdEose0cBA[0-9A-Za-z]+",
    "Facebook Client ID": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}[0-9]{13,17}",
    "Facebook Client Secret": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}[0-9a-zA-Z]{32}",
    "Facebook OAuth Access Token": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}['|\"][0-9]{13,17}['|\"]",
    "Facebook OAuth Secret": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}['|\"][0-9a-zA-Z]{32}['|\"]",
    "Facebook OAuth Token": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}['|\"][0-9a-f]{32}['|\"]",
    "GitHub": "[gG][iI][tT][hH][uU][bB].{0,20}['|\"][0-9a-zA-Z]{35,40}['|\"]",
    "LinkedIn Client ID": "[lL][iI][nN][kK][eE][dD][iI][nN].{0,20}[0-9a-z]{12}",
    "LinkedIn Client Secret": "[lL][iI][nN][kK][eE][dD][iI][nN].{0,20}[0-9a-zA-Z]{16}",
    "LinkedIn OAuth Access Token": "[lL][iI][nN][kK][eE][dD][iI][nN].{0,20}['|\"][0-9a-zA-Z]{16}['|\"]",
    "Google (GCP) Service-account": "\"type\": \"service_account\"",
    "Google (GCP) OAuth Access Token": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com",
    "Heroku API Key": "[hH][eE][rR][oO][kK][uU].{0,20}[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}",
    "JSON Web Token": "eyJhbGciOiJ",
    "JSON Web Token 2": "ey[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*",
    "Json Web Token" : "eyJhbGciOiJ",
    "MailChimp API Key": "[0-9a-f]{32}-us[0-9]{1,2}",
    "Mailgun API Key": "key-[0-9a-zA-Z]{32}",
    "Password in URL": "[a-zA-Z]{3,10}://[^/\\s:@]{3,20}:[^/\\s:@]{3,20}@.{1,100}[\"'\\s]",
    "PayPal Braintree Access Token": "access_token\\$production\\$[0-9a-z]{16}\\$[0-9a-f]{32}",
    "PayPal Braintree Sandbox Access Token": "access_token\\$sandbox\\$[0-9a-z]{16}\\$[0-9a-f]{32}",
    "PayPal Client ID": "AdAt[0-9a-z]{32}",
    "PayPal Secret": "Esk[0-9a-z]{32}",
    "Paystack Secret Key": "sk_test_[0-9a-zA-Z]{30}",
    "Picatic API Key": "sk_live_[0-9a-z]{32}",
    "Slack Webhook": "https://hooks\\.slack\\.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}",
    "Stripe API Key": "sk_live_[0-9a-zA-Z]{24}",
    "Stripe Restricted API Key": "rk_live_[0-9a-zA-Z]{24}",
    "Stripe Webhook Secret": "whsec_[0-9a-zA-Z]{24}",
    "Square Access Token": "sq0atp-[0-9A-Za-z\\-_]{22}",
    "Square OAuth Secret": "sq0csp-[0-9A-Za-z\\-_]{43}",
    "Telegram Bot API Key": "[0-9]+:AA[0-9A-Za-z\\-_]{33}",
    "Twilio Account SID": "AC[0-9a-fA-F]{32}",
    "Twilio Auth Token": "TW[0-9a-fA-F]{32}",
    "Twilio API Key": "SK[0-9a-fA-F]{32}",
    "Github Auth Creds": "https:\/\/[a-zA-Z0-9]{40}@github\.com",
    "Github Personal Access Token": "[a-zA-Z0-9]{40}",
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
    "Twitter Secret": "[tT][wW][iI][tT][tT][eE][rR].*['|\"][0-9a-zA-Z]{35,44}['|\"]",
    "Twitter API Key": "[tT][wW][iI][tT][tT][eE][rR].*['|\"][0-9a-zA-Z]{35,44}['|\"]",
    "Twitter API Secret": "[tT][wW][iI][tT][tT][eE][rR].*['|\"][0-9a-zA-Z]{35,44}['|\"]",
    "Twitter OAuth Creds": "https:\/\/[a-zA-Z0-9]{40}@twitter\.com",
    "Twitter OAuth Creds (Legacy)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com",
    "Twitter OAuth Creds (V2)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2",
    "Twitter OAuth Creds (V2.1)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/1",
    "Twitter OAuth Creds (V2.2)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/2",
    "Twitter OAuth Creds (V2.3)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/3",
    "Twitter OAuth Creds (V2.4)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/4",
    "Twitter OAuth Creds (V2.5)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/5",
    "Twitter OAuth Creds (V2.6)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/6",
    "Twitter OAuth Creds (V2.7)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/7",
    "Twitter OAuth Creds (V2.8)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/8",
    "Twitter OAuth Creds (V2.9)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/9",
    "Twitter OAuth Creds (V2.10)": "https:\/\/[a-zA-Z0-9]{40}@api\.twitter\.com\/2\/10",
    // "NAME": "Regex"
    "Apr1 MD5": "\$apr1\$[a-zA-Z0-9_/\\.]{8}\$[a-zA-Z0-9_/\\.]{22}",
    "MD5": "[a-f0-9]{32}",
    "MD5 or SHA1": "[a-f0-9]{32}|[a-f0-9]{40}",
    "SHA1": "[a-f0-9]{40}",
    "SHA256": "[a-f0-9]{64}",
    "SHA512": "[a-f0-9]{128}",
    "MD5 or SHA1 or SHA256": "[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64}",
    "MD5 or SHA1 or SHA256 or SHA512": "[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64}|[a-f0-9]{128}",
    "Apache SHA": "\{SHA\}[0-9a-zA-Z/_=]{10,}",
    "IP V4 Address": "\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    "Slack App Token": "\\bxapp-[0-9]+-[A-Za-z0-9_]+-[0-9]+-[a-f0-9]+\\b",
    "Phone Number": "\\b(\\+\\d{1,2}\\s)?\\(\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}\\b",
    "AWS Access ID": "\\b(AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{12,}\\b",
    "MAC Address": "\\b((([a-zA-z0-9]{2}[-:]){5}([a-zA-z0-9]{2}))|(([a-zA-z0-9]{2}:){5}([a-zA-z0-9]{2})))\\b",
    "Github Classic Personal Access Token": "\\bghp_[A-Za-z0-9_]{36}\\b",
    "Github Fine Grained Personal Access Token": "\\bgithub_pat_[A-Za-z0-9_]{82}\\b",
    "Github OAuth Access Token": "\\bgho_[A-Za-z0-9_]{36}\\b",
    "Github User to Server Token": "\\bghu_[A-Za-z0-9_]{36}\\b",
    "Github Server to Server Token": "\\bghs_[A-Za-z0-9_]{36}\\b",
    "Heroku API Key": "\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b",
    "Stripe Key": "\\b(?:r|s)k_(test|live)_[0-9a-zA-Z]{24}\\b",
    "Firebase Auth Domain": "\\b([a-z0-9-]){1,30}(\.firebaseapp\.com)\\b",
    "Apr1 MD5": "\$apr1\$[a-zA-Z0-9_/\.]{8}\$[a-zA-Z0-9_/\.]{22}",
    

    // "NAME": "Regex"
    // Add more patterns as needed


};

const generics = {
    "Generic API Key": "[aA][pP][iI]_?[kK][eE][yY].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic Secret Key": "[sS][eE][cC][rR][eE][tT]_?[kK][eE][yY].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic API Secret": "[aA][pP][iI]_?[sS][eE][cC][rR][eE][tT].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic Secret": "[sS][eE][cC][rR][eE][tT].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic OAuth": "[aA][pP][iI]_?[sS][eE][cC][rR][eE][tT].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic API": "[aA][pP][iI].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic ID": "[aA][pP][iI]_?[iI][dD].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",
    "Generic Password": "[aA][pP][iI]_?[pP][aA][sS][sS][wW][oO][rR][dD].{0,20}['|\"][0-9a-zA-Z]{32,45}['|\"]",


    // "NAME": "Regex",
    // Add more patterns as needed
};

const aws = {
    "AWS API Key": "((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})",
    "AWS Secret Key": "(?:(?:[a-zA-Z0-9/+]{4}-){3}[a-zA-Z0-9/+]{12})",
    "AWS Session Token": "(?:(?:[a-zA-Z0-9/+]{4}-){3}[a-zA-Z0-9/+]{12})",
    "AWS MWS Auth Token": "amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",

    // "NAME": "Regex",
    // Add more patterns as needed
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
    "passcode": /passcode\s*=\s*([^\s&]+)/i,
    "pw": /pw\s*=\s*([^\s&]+)/i,

    // "NAME": Regex,
    // Add more patterns as needed

};

const denyList = ["AIDAAAAAAAAAAAAAAAAA"];

// Function to check data against patterns
function checkData(data, src, regexes, fromEncoded = false, parentUrl, parentOrigin) {
    const findings = [];
    const foundMatches = new Set(); // Store found matches to avoid duplicates
    for (const key in regexes) {
        const re = new RegExp(regexes[key]);
        let match = re.exec(data);
        if (Array.isArray(match)) { match = match.toString(); }
        if (denyList.includes(match)) {
            continue;
        }
        if (match && !foundMatches.has(match)) { // Check if match is not already found
            const finding = {
                src: src,
                match: match,
                key: key,
                encoded: fromEncoded,
                parentUrl: parentUrl,
            };
            findings.push(finding);
            foundMatches.add(match); // Add match to the set of found matches
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
