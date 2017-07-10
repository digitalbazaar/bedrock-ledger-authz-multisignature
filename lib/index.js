/*!
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brLedger = require('bedrock-ledger');
const jsigs = require('jsonld-signatures')();
const BedrockError = bedrock.util.BedrockError;
const brDidClient = require('bedrock-did-client');

require('./config');

jsigs.use('jsonld', brDidClient.jsonld);

bedrock.events.on('bedrock.start', callback => {
  brLedger.use({
    capabilityName: 'SignatureGuard2017',
    capabilityValue: {
      type: 'guard',
      api: api
    }
  }, callback);
});

const api = {};
// NOTE: only exported for tests
module.exports = api;

api.isValid = function(event, guardConfig, callback) {
  if(!guardConfig.eventFilter.some(f =>
    f.type === 'EventTypeFilter' && f.eventType.includes(event.type))) {
    return callback(new BedrockError(
      'Invalid configuration.', 'InvalidConfig', {
        eventType: event.type
      }));
  }
  const trustedSigners = {};
  guardConfig.approvedSigner.forEach(s => trustedSigners[s] = false);
  const signatureCount = [].concat(event.signature).length;
  // no need to proceed if total signatures do not meet minimum requirements
  if(signatureCount < guardConfig.minimumSignaturesRequired) {
    return callback(null, false);
  }

  const keyOwners = {};
  jsigs.verify(event, {
    checkKeyOwner: (owner, key, options, callback) => {
      if(trustedSigners[owner.id] === undefined &&
        trustedSigners[owner.publicKey] === undefined) {
        return callback(null, false);
      }
      keyOwners[owner.publicKey] = owner.id;
      callback(null, true);
    }
  }, (err, result) => {
    if(err) {
      return callback(new BedrockError(
        'An error occurred during validation.', 'ValidationError', {}, err));
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

    callback(null, verifiedSignatures >= guardConfig.minimumSignaturesRequired);
  });
};
