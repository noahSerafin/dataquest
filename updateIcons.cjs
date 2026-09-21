const fs = require("fs");
function extractArray(content, varName) {
    const regex = new RegExp(`export const ${varName} = \\[(.*?)\\]`, "s");
    const match = content.match(regex);
    if (!match) throw new Error("Not found: " + varName);
    let text = match[1].replace(/\/\/.*$/gm, "");
    return text.split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== "Spawn");
}

let currentId = 0;
function processFile(filename, arrayName) {
    let content = fs.readFileSync(filename, "utf8");
    
    // STRIP all existing static iconIDs!
    content = content.replace(/^\s*static\s+iconID\s*=\s*\d+;\s*$/gm, "");

    const elements = extractArray(content, arrayName);
    
    for (const className of elements) {
        const classRegex = new RegExp(`(class\\s+${className}(?:\\s+extends\\s+[^{]+)?\\s*\\{)`, "g");
        let found = false;
        content = content.replace(classRegex, (match, p1) => {
            found = true;
            return `${p1}\n  static iconID = ${currentId};`;
        });
        
        if (found) {
            currentId++;
        } else {
            console.warn(`Class ${className} not found in ${filename}`);
        }
    }
    
    fs.writeFileSync(filename, content);
}

processFile("src/Pieces.ts", "allPieces");
processFile("src/Items.ts", "allItems");
processFile("src/AdminPrograms.ts", "allAdmins");
processFile("src/Bosses.ts", "allBosses");

console.log("Total assigned:", currentId);
