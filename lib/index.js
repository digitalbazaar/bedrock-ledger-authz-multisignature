/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brLedger = require('bedrock-ledger');
const config = bedrock.config;
let didio = require('did-io');
let jsigs = require('jsonld-signatures')();
let jsonld = bedrock.jsonld;
const BedrockError = bedrock.util.BedrockError;
require('bedrock-did-client');

require('./config');

// const logger = bedrock.loggers.get('app');

bedrock.events.on('bedrock.init', () => {
  // get configured lib instances
  jsonld = jsonld();
  didio = didio();
  didio.use('jsonld', jsonld);
  jsonld.documentLoader = didio.createDocumentLoader({
    wrap: function(url, callback) {
      return bedrock.jsonld.documentLoader(url, callback);
    },
    baseUrl: config['did-client']['authorization-io'].didBaseUrl + '/'
  });
  jsigs = jsigs();
  jsigs.use('jsonld', jsonld);
});

bedrock.events.on('bedrock.start', callback => {
  brLedger.use({
    capabilityName: 'MultiSignature2017',
    capabilityValue: {
      type: 'authorization',
      api: api
    }
  }, callback);
});

const api = {};
// NOTE: only exported for tests
module.exports = api;

api.isAuthorized = function(ledgerMeta, block, callback) {
  const authTypes = {
    WebLedgerConfigurationBlock: 'configurationBlockAuthorizationMethod',
    WebLedgerEventBlock: 'eventBlockAuthorizationMethod'
  };
  if(!Object.keys(authTypes).includes(block.type)) {
    return callback(new BedrockError(
      'Invalid block type.', 'InvalidBlockType'));
  }
  const authConfig = ledgerMeta.ledgerConfig[authTypes[block.type]];
  if(authConfig.type !== 'LinkedDataSignature2015') {
    return callback(new BedrockError(
      'The ledger is not configured to use this authorization method.',
      'InvalidStateError'));
  }

  const trustedSigners = {};
  authConfig.approvedSigner.forEach(s => trustedSigners[s] = false);
  const signatureCount = [].concat(block.signature).length;
  // no need to proceed if total signatures do not meet minimum requirements
  if(signatureCount < authConfig.minimumSignaturesRequired) {
    return callback(null, false);
  }

  const keyOwners = {};
  jsigs.verify(block, {
    checkKeyOwner: (owner, key, options, callback) => {
      if(trustedSigners[owner.id] === undefined &&
        trustedSigners[owner.publicKey] === undefined) {
        return callback(null, false);
      }
      keyOwners[owner.publicKey] = owner.id;
      callback(null, true);
    }
  }, (err, result) => {
    // return false on any error
    if(err) {
      // TODO: log errors
      return callback(null, false);
    }

    // trustedSigner may be a publicKey or an owner
    result.keyResults.filter(k => k.verified).forEach(k => {
      if(trustedSigners[k.publicKey] === false) {
        trustedSigners[k.publicKey] = true;
      } else if(trustedSigners[keyOwners[k.publicKey]] === false) {
        trustedSigners[keyOwners[k.publicKey]] = true;
      }
    });

    let verifiedSignatures = 0;
    Object.keys(trustedSigners).forEach(
      s => trustedSigners[s] ? verifiedSignatures++ : null);

    // TODO: log result?

    return callback(
      null, verifiedSignatures >= authConfig.minimumSignaturesRequired);
  });
};
