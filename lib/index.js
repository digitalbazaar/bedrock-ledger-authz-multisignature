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
    capabilityName: 'SignatureValidator2017',
    capabilityValue: {
      type: 'validator',
      api: api
    }
  }, callback);
});

const api = {};
// NOTE: only exported for tests
module.exports = api;

api.validateEvent = (event, validatorConfig, callback) => {
  if(!validatorConfig.eventFilter.some(f =>
    f.type === 'EventTypeFilter' && f.eventType.includes(event.type))) {
    return callback(new BedrockError(
      'Invalid configuration.', 'InvalidConfig', {
        eventType: event.type
      }));
  }
  const trustedSigners = {};
  validatorConfig.approvedSigner.forEach(s => trustedSigners[s] = false);
  const signatureCount = [].concat(event.signature).length;
  // no need to proceed if total signatures do not meet minimum requirements
  if(signatureCount < validatorConfig.minimumSignaturesRequired) {
    return callback(new BedrockError(
      'The signature requirements have not been met.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true,
        event,
        signatureCount,
        minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
      }));
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
        'An error occurred during signature verification.', 'ValidationError', {
          httpStatusCode: 400,
          public: true
        }, err));
    }
    const keyResults = result.keyResults;
    // trustedSigner may be a publicKey or an owner
    keyResults.filter(k => k.verified).forEach(k => {
      if(trustedSigners[k.publicKey] === false) {
        trustedSigners[k.publicKey] = true;
      } else if(trustedSigners[keyOwners[k.publicKey]] === false) {
        trustedSigners[keyOwners[k.publicKey]] = true;
      }
    });

    let verifiedSignatures = 0;
    Object.keys(trustedSigners).forEach(
      s => trustedSigners[s] ? verifiedSignatures++ : null);

    if(verifiedSignatures < validatorConfig.minimumSignaturesRequired) {
      return callback(new BedrockError(
        'The signature requirements have not been met.',
        'ValidationError', {
          httpStatusCode: 400,
          public: true,
          event,
          trustedSigners,
          signatureCount,
          verifiedSignatures,
          keyResults,
          minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
        }));
    }
    // success
    callback();
  });
};
