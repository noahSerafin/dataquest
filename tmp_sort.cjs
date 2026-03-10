const fs = require('fs');

const itemsStr = fs.readFileSync('c:/Users/noahs/OneDrive/Documents/Dev/dataquest/src/Items.ts', 'utf8');
const listRegex = /export const allItems = \[([^\]]+)\]/;
const listMatch = itemsStr.match(listRegex);

if (!listMatch) {
    console.log("Could not find allItems");
    process.exit(1);
}

const names = Array.from(new Set(listMatch[1].split(',').map(s => s.trim().split(/\s+/)[0]).filter(s => s && !s.startsWith('//'))));

const objects = names.map(className => {
    const regexName = new RegExp(`class ${className}\\b[\\s\\S]*?static name = ["'\`]+([^"'\`]+)["'\`]+`);
    const regexRarity = new RegExp(`class ${className}\\b[\\s\\S]*?static rarity = (\\d+)`);
    
    const nMatch = itemsStr.match(regexName);
    const rMatch = itemsStr.match(regexRarity);
    
    let rarityVal = 99; // fallback
    if (rMatch) rarityVal = parseInt(rMatch[1]);
    
    let nameVal = className;
    if (nMatch) nameVal = nMatch[1]; // display name

    return { className, nameVal, rarityVal };
});

objects.sort((a, b) => {
    if (a.rarityVal !== b.rarityVal) return a.rarityVal - b.rarityVal;
    return a.nameVal.localeCompare(b.nameVal);
});

const newArrayStr = objects.map(o => o.className).join(', ');
fs.writeFileSync('c:/Users/noahs/OneDrive/Documents/Dev/dataquest/tmp_sort_output.txt', `export const allItems = [${newArrayStr}];`);
