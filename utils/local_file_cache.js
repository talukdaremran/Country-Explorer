import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheDir = path.join(__dirname, '..', 'cache');

await fs.mkdir(cacheDir, { recursive: true });      // creates /cache if doesn't exists 
                                                    // if exists no error

const CACHE_FILE = path.join(cacheDir, 'countries_cache.json');

async function loadCacheFromFile() {
    try {
        const data = await fs.readFile(CACHE_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return null;
    }
}

async function saveCacheToFile(data) {
    await fs.writeFile(
        CACHE_FILE,
        JSON.stringify(data, null, 2)
    );
}

export { loadCacheFromFile, saveCacheToFile };