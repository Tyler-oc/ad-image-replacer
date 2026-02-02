import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EASYLIST_PATH = path.join(__dirname, '../easylist.txt');
const RULES_PATH = path.join(__dirname, '../rules.json');
const REDIRECT_URL = "https://static01.nyt.com/images/2020/03/09/sports/09nba-topteams1/09nba-topteams1-mediumSquareAt3X.jpg";
const MAX_RULES = 20000; // Safe limit for Chrome static rulesets

function processEasyList() {
    try {
        const data = fs.readFileSync(EASYLIST_PATH, 'utf8');
        const lines = data.split('\n');
        const rules = [];
        let idCounter = 1;

        for (const line of lines) {
            if (rules.length >= MAX_RULES) break;

            const trimmed = line.trim();
            // Basic parsing for simple domain blocking rules starting with || and ending with ^
            // Example: ||doubleclick.net^
            if (trimmed.startsWith('||') && trimmed.endsWith('^')) {
                const domain = trimmed.substring(2, trimmed.length - 1);
                
                // Skip if it contains other special chars for now (keep it simple for MVP)
                if (domain.includes('/') || domain.includes('*')) continue;

                rules.push({
                    "id": idCounter++,
                    "priority": 1,
                    "action": {
                        "type": "redirect",
                        "redirect": { "url": REDIRECT_URL }
                    },
                    "condition": {
                        "urlFilter": domain,
                        "resourceTypes": ["image", "sub_frame", "script", "xmlhttprequest"]
                    }
                });
            }
        }

        fs.writeFileSync(RULES_PATH, JSON.stringify(rules, null, 2));
        console.log(`Generated ${rules.length} rules in ${RULES_PATH}`);

    } catch (err) {
        console.error("Error processing EasyList:", err);
    }
}

processEasyList();
