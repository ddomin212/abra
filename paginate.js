const btoa = require('btoa');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const auth = 'Basic ' + btoa(`${process.env.AUSERNAME}:${process.env.APASSWORD}`);
const LIMIT = 20;
const SKLAD_NAME = 'SKLAD';
const filePath = path.join(__dirname, `static/SKLAD_paginate.xml`);
fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><SHOP>');


const builder = new xml2js.Builder({ headless: true }); // incializuj prevodnik na XML

let counter = -LIMIT; // zaciname na -LIMIT aby prvni byla nula (trochu divny ale funguje to)

/**
   * Vygeneruj XML s pouzitim paginace
   * @return {void}
*/
function fetchDataXMLPaginate() {
  const headers = {
    'Authorization': auth
  };

  counter += LIMIT; // posun startovni pozici (jakoby stranka)
  
  // zavolej API a vezmi 20 polozek
  return fetch(`https://${process.env.AFIRMA}.flexibee.eu:${process.env.APORT}/c/${process.env.AFIRMA}/skladova-karta/(sklad%20=%2054).json?detail=custom:dostupMj,cenik&start=${counter}&limit=${LIMIT}&no-ext-ids=true`, { headers })
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

      if (skladovaKarta.length === 0) { // pokud je prazdna tak skonci, end condition pro rekurzi
        fs.appendFileSync(filePath, '</SHOP>');
        throw new Error('"skladova-karta" is empty');
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

      const shop = {
        SHOPITEM: shopItems
      };

      // postav to s wrapperem kterej potom odebereme
      const xml = builder.buildObject({ WRAPPER: shop }); 
      const trimmed = xml.replace(/<WRAPPER>|<\/WRAPPER>/g, '').trim();

      // appendni pouze SHOPITEM do souboru
      fs.appendFileSync(filePath, trimmed);

      // a znova zavolej funkci
      fetchDataXMLPaginate()
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}

fetchDataXMLPaginate();