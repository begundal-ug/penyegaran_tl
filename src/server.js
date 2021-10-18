import App from './App';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import express from 'express';
import { renderToString } from 'react-dom/server';

const bodyParser = require("body-parser");
const {
  getRandom
} = require('./data');

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const cssLinksFromAssets = (assets, entrypoint) => {
  return assets[entrypoint] ? assets[entrypoint].css ?
  assets[entrypoint].css.map(asset=>
    `<link rel="stylesheet" href="${asset}">`
  ).join('') : '' : '';
};

const jsScriptTagsFromAssets = (assets, entrypoint, extra = '') => {
  return assets[entrypoint] ? assets[entrypoint].js ?
  assets[entrypoint].js.map(asset=>
    `<script src="${asset}"${extra}></script>`
  ).join('') : '' : '';
};

const server = express();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/api/random', async (req, res) => {
    // TODO: move this API to foldering path if needed
    const randUsers = await getRandom();
    res.json(randUsers);
  })
  .get('/*', (req, res) => {
    const context = {};
    const markup = renderToString(
      <StaticRouter context={context} location={req.url}>
        <App />
      </StaticRouter>
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>@Penyegaran_TL</title>
        <link rel="apple-touch-icon" sizes="192x192" href="https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc7275.png">
        <link rel="mask-icon" sizes="any" href="https://abs.twimg.com/responsive-web/client-web/icon-svg.168b89d5.svg" color="#1da1f2">
        <link rel="shortcut icon" href="//abs.twimg.com/favicons/twitter.ico" type="image/x-icon">
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover">
        ${cssLinksFromAssets(assets, 'client')}
    </head>
    <body>
        <div id="root">${markup}</div>
        ${jsScriptTagsFromAssets(assets, 'client', ' defer crossorigin')}
    </body>
</html>`
      );
    }
  });

export default server;
