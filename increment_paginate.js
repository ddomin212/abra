const btoa = require('btoa');
const { getDateTime } = require('./utils/api');
const { parseAPIResponse } = require('./utils/parsing');
require('dotenv').config();

const TIMESTAMP = getDateTime("2023-05-01T00:00:00"); // vezmi datum posledniho zapisu do XML
const AUTH = 'Basic ' + btoa(`${process.env.AUSERNAME}:${process.env.APASSWORD}`);
const LIMIT = 20;

let itemIds = [];
let itemStocks = [];
let itemLastUpdates = [];
let counter = -LIMIT;

/**
   * Iterativne aktualizuj XML pouze o zmenene itemy od TIMESTAMP data, s pouzitim paginace
   * @return {void}
*/
function fetchDataXMLIterPagi() {
  const headers = {
    'Authorization': AUTH
  };

  counter += LIMIT;
  
  return fetch(`https://${process.env.AFIRMA}.flexibee.eu:${process.env.APORT}/c/${process.env.AFIRMA}/skladova-karta/(sklad%20=%2054%20and%20lastUpdate%20gt%20${TIMESTAMP}).json?detail=custom:dostupMj,cenik,lastUpdate&start=${counter}&limit=${LIMIT}&no-ext-ids=true`, { headers })
    .then(response => {
      if (!response.ok) {
        console.error(`Request failed with status: ${response.status}`);
      }
      
      return response.json();
    })
    .then(data => {
      parseAPIResponse(data, itemIds, itemStocks, itemLastUpdates, AUTH)
      fetchDataXMLIterPagi(); // rekurzivne zavolej dalsi stranku
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}

fetchDataXMLIterPagi()
