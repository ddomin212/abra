const { saveIncrementalXML } = require('./xml');
const { fetchKomplety, dostupnostForKomplety } = require('./api');

/**
   * parsne API response a ulozi dulezite informace
   * @param  {Object} data  API response
   * @param  {number[]} itemIds  list IDs zmenenych itemu
   * @param  {number[]} itemStocks  list kusu na sklade u zmenenych itemu
   * @param  {string[]} itemLastUpdates  list datumu posledni zmeny u zmenenych itemu, pro logging
   * @param  {String} auth  authentikace pro API
   * @return {void}
*/
function parseAPIResponse(data, itemIds, itemStocks, itemLastUpdates, auth) {
  const skladovaKarta = data['winstrom']['skladova-karta'];

  if (!skladovaKarta || !Array.isArray(skladovaKarta)) {
    throw new Error('"skladova-karta" field is missing or not an array');
  }

  if (skladovaKarta.length === 0) {
    saveIncrementalXML(itemIds, itemStocks, itemLastUpdates); // prepis pouze zmenene radky v XML
    throw new Error('"skladova-karta" is empty');
  } // end condtion pro rekurzi

  skladovaKarta.map(item => {
    const ITEM_ID = item.cenik.split(':')[1];
    
    fetchKomplety(item['cenik@ref'], auth).then(data => {
      itemIds.push(ITEM_ID);
      itemLastUpdates.push(item.lastUpdate);
      itemStocks.push(item.dostupMj);

      if (data.length > 0) {
        itemStocks[itemStocks.length - 1] = dostupnostForKomplety(data); // vezmi dostupnost v zavislosti na kompletech a sadach
      }
    }).catch(error => {
      throw new Error('Error while fetching komplety:', error.message);
    });
  }); // pridej vsechny dulezite udaje o zmenenych itemech do poli
}

module.exports = {
  parseAPIResponse
};