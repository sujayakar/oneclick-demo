import * as fs from "fs";
import * as path from "path";
import { exec, execFile } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

const contentTypes  = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",    
}

const promises = [];

async function walkDir(root, dirPath) {
    // Read all items in the directory
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(root, fullPath);

        if (item.isDirectory()) {
            // If it's a directory, recursively walk through it
            await walkDir(root, fullPath);
            continue;
        } 
        const ext = path.extname(relativePath);
        const contentType = contentTypes[ext];
        if (!contentType) {
            console.log("Unknown file type", ext, relativePath);
            continue;
        }                

        const promise = async () => {
            console.log("Uploading", relativePath);
            const { stdout, stderr } = await execAsync(`npx convex run assets:startUpload`);
            if (stderr) {
                console.error('stderr:', stderr);
            }
            const url = JSON.parse(stdout).trim();
    
            const contents = fs.readFileSync(fullPath);
            const resp = await fetch(url, {
                method: "POST",
                body: contents,
                headers: {
                    "Content-Type": contentType,
                },
            });
            if (!resp.ok) {
                throw new Error(`Failed to upload file ${relativePath}: ${resp.statusText}`);
            }
            const { storageId } = await resp.json();        
            const args = {
                path: relativePath,
                id: storageId,
                contentType: contentType,
            }        
            await execFileAsync('npx', ['convex', 'run', 'assets:uploadAsset', JSON.stringify(args)]);        
        }
        promises.push(promise());
    }
}

try {    
    const promise = async () => {
        const normalized = path.normalize('./dist');
        await walkDir(normalized, normalized);
        await Promise.all(promises);
    }
    promise()
        .then(() => {
            console.log("Upload complete");
        })
        .catch(error => {
            console.error('Error in async operation:', error);
        });
} catch (error) {
    console.error('Error walking directory:', error);
}