const fs = require('fs');

try {
    const piecesStr = fs.readFileSync('c:/Users/noahs/OneDrive/Documents/Dev/dataquest/src/Pieces.ts', 'utf8');
    const adminsStr = fs.readFileSync('c:/Users/noahs/OneDrive/Documents/Dev/dataquest/src/AdminPrograms.ts', 'utf8');

    let out = '';

    function sortArray(fileStr, exportName) {
        const listRegex = new RegExp(`export (const|let) ${exportName} = \\[([^\\]]+)\\]`);
        const listMatch = fileStr.match(listRegex);
        if (!listMatch) {
            out += `Could not find ${exportName}\n`;
            return;
        }

        const names = listMatch[2].split(',').map(s => s.trim().split(/\s+/)[0]).filter(s => s && s !== '//Dolls' && !s.startsWith('//'));
        const objects = names.map(className => {
            const regexName = new RegExp(`class ${className}[\\s\\S]*?static name = ["'\`]+([^"'\`]+)["'\`]+`);
            const regexRarity = new RegExp(`class ${className}[\\s\\S]*?static rarity = (\\d+)`);
            const nMatch = fileStr.match(regexName);
            const rMatch = fileStr.match(regexRarity);
            
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
        out += `\nSorted ${exportName} length: ${objects.length}\n`;
        out += `export const ${exportName} = [${newArrayStr}];\n`;
    }

    sortArray(piecesStr, 'allPieces');
    sortArray(adminsStr, 'allAdmins');

    fs.writeFileSync('c:/Users/noahs/OneDrive/Documents/Dev/dataquest/parseOutput.txt', out, 'utf8');
    console.log("Success");
} catch (e) {
    fs.writeFileSync('c:/Users/noahs/OneDrive/Documents/Dev/dataquest/parseOutput.txt', e.stack, 'utf8');
}
