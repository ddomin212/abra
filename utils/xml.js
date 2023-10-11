const readline = require('readline');
const fs = require('fs');
const path = require('path');


const filePath = path.join(__dirname, `../static/SKLAD_paginate.xml`); // origo XML
const newFilePath = path.join(__dirname, `../static/SKLAD_paginate_updated.xml`); // novy XML

/**
   * Vymeni hodnotu uvnitr <VALUE> XML tagu.
   * @param  {String} inputString  radek v XML souboru s tagem <VALUE>
   * @param  {String} replacementValue  co tam chces dat misto toho co tam je
   * @return {String}     inputString s novou hodnotou uvnitr tagu <VALUE>
*/
function replaceValuesInsideTags(inputString, replacementValue) {
    const regex = /<VALUE>(.*?)<\/VALUE>/g;
    const resultString = inputString.replace(regex, `<VALUE>${replacementValue}</VALUE>`);
    
    return resultString;
}

/**
   * Da ti datetime ve formatu kterej potrebujes.
   * @param  {String} itemIds  list IDs zmenenych itemu
   * @param  {String} itemStocks  list kusu na sklade u zmenenych itemu
   * @param  {String} itemLastUpdates  list datumu posledni zmeny u zmenenych itemu, pro logging
   * @return {void}
*/
function saveIncrementalXML(itemIds, itemStocks, itemLastUpdates) {
    let toChange;
    let changeIdx;
  
    const writeStream = fs.createWriteStream(newFilePath);
  
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      output: process.stdout,
      terminal: false
    });
  
    rl.on('line', (line) => {
      // console.log("LINE: ", line);
        for (i = 0; i < itemIds.length; i++) {
            if (line.includes(itemIds[i])) { // pokud najdes ITEM_ID napric zmenenyma polozkama, tak si zapamatujes index a to ze se to ma zmenit
                // console.log("CHANGED ITEM: ", line);
                // console.log("== DATE: ", itemLastUpdates[i]);
                toChange = true;
                changeIdx = i;
            }
        }
        if (toChange && line.includes('VALUE')) { // pokud se to ma zmenit, prepises hodnotu uvnitr VALUE tagu pro dane ITEM_ID
            result = replaceValuesInsideTags(line, itemStocks[changeIdx])
            toChange = false;
            // console.log("== CHANGED VALUE: ", line);
            writeStream.write(result + '\n'); // zapises zmeneny radek do noveho souboru
        } else {
            writeStream.write(line + '\n');
        }
    });
  
    rl.on('close', () => {
      console.log('Processing finished.');
    });
  }

module.exports = {saveIncrementalXML};