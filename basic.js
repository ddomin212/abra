const btoa = require('btoa');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const auth = 'Basic ' + btoa(`${process.env.AUSERNAME}:${process.env.APASSWORD}`);
const YOUR_JSON_API_URL = `https://${process.env.AFIRMA}.flexibee.eu:${process.env.APORT}/c/${process.env.AFIRMA}/skladova-karta/(sklad%20=%2054).json?detail=custom:dostupMj,cenik&limit=0&no-ext-ids=true`;
const SKLAD_NAME = 'SKLAD';
const BUILDER = new xml2js.Builder();

/**
   * Vygeneruj XML soubor pro SKLAD
   * @return {void}
*/
function fetchDataXML() {
  const headers = {
    'Authorization': auth
  };

  // zavolej API
  return fetch(YOUR_JSON_API_URL, { headers })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // vezmi skladovou kartu
      const skladovaKarta = data['winstrom']['skladova-karta'];
      if (!skladovaKarta || !Array.isArray(skladovaKarta)) { // vykasli se na to pokud je prazdna nebo neni pole
        throw new Error('"skladova-karta" field is missing or not an array');
      }

      const shopItems = skladovaKarta.map(item => { 
        const ITEM_ID = item.cenik.split(':')[1];

        // pro kazdou polozku vytvor element, ktery se bude vkladat do XML
        return {
          ITEM_ID,
          STOCK: {
            WAREHOUSES: {
              WAREHOUSE: [
                {
                  NAME: SKLAD_NAME,
                  VALUE: item.dostupMj
                },
              ]
            }
          }
        };
      });

      // vytvor SHOP
      const shop = {
        SHOPITEM: shopItems
      };

      // preved to do XML stringu
      
      const xml = BUILDER.buildObject({ SHOP: shop });

      // uloz to do souboru
      const filePath = path.join(__dirname, 'static/SKLAD.xml'); // Save in the same directory as the script
      fs.writeFileSync(filePath, xml);

    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}

fetchDataXML();
