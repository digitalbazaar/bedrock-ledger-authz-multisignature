/*
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
const {jsonLdDocumentLoader} = require('bedrock-jsonld-document-loader');

require('bedrock-ledger-validator-signature');
require('bedrock-ledger-context');

bedrock.events.on('bedrock.init', () => {
  const mockData = require('./mocha/mock.data');
  for(const url in mockData.ldDocuments) {
    jsonLdDocumentLoader.addStatic(url, mockData.ldDocuments[url]);
  }
});

require('bedrock-test');
bedrock.start();
