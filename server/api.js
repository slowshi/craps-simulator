import promise from 'promise'
import fs from 'fs'
import Craps from './Craps'
import bodyParser from 'body-parser'

var init = function(res) {
  var io = res.io;
  var app = res.app;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  // bittrexApi.loadApiKeys();
  // app.post('/Bittrex/GetBalances', bittrexApi.getBalances);
  // app.post('/Bittrex/GetOrders', bittrexApi.getOrders);
  // app.post('/Bittrex/GetOrderHistory', bittrexApi.getOrderHistory);
  // app.post('/CC/PriceFull', ccApi.priceFull);
  // app.post('/CC/GetIndicators', ccApi.getIndicators);
  // app.post('/Bittrex/GetIndicators', bittrexApi.getIndicators);
  // app.post('/Bittrex/GetMarket', bittrexApi.getMarket);
  // app.post('/Iota/GenerateSeed', iotaApi.generateSeed);
  // app.post('/Iota/GetBalance', iotaApi.getBalance);
};


module.exports = {
  init: init,
};