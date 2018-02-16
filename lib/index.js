/*!
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brLedgerNode = require('bedrock-ledger-node');
const jsigs = require('jsonld-signatures')();
const brDidClient = require('bedrock-did-client');
const validate = require('bedrock-validation').validate;
const BedrockError = bedrock.util.BedrockError;

require('./config');

// FIXME: `brDidClient` needs updating to do proper DID resolution, at the
//   time of this writing it used auth.io instead of DID methods
jsigs.use('jsonld', brDidClient.jsonld);

bedrock.events.on('bedrock.start', () => {
  brLedgerNode.use('SignatureValidator2017', {
    type: 'validator',
    api: api
  });
});

const api = {};
// NOTE: only exported for tests
module.exports = api;

api.mustValidate = (input, validatorConfig, options, callback) => {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  api.validateConfiguration(validatorConfig, err => {
    if(err) {
      return callback(err);
    }
    if(!(input && typeof input === 'object')) {
      return callback(null, false);
    }
    if(validatorConfig.validatorFilter &&
      !validatorConfig.validatorFilter.some(f =>
        f.type === 'ValidatorFilterByType' &&
        f.validatorFilterByType.includes(input.type))) {
      return callback(null, false);
    }
    callback(null, true);
  });
};

api.validateConfiguration = (validatorConfig, callback) =>
  validate('ledger-validator-signature-config', validatorConfig, callback);

api.validate = (input, validatorConfig, callback) => {
  const trustedSigners = {};
  validatorConfig.approvedSigner.forEach(s => trustedSigners[s] = false);

  // FIXME: only support `proof`
  const signatureCount = (input.signature) ?
    [].concat(input.signature).length :
    [].concat(input.proof).length;
  // no need to proceed if total signatures do not meet minimum requirements
  if(signatureCount < validatorConfig.minimumSignaturesRequired) {
    return callback(new BedrockError(
      'The signature requirements have not been met.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true,
        input,
        signatureCount,
        minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
      }));
  }

  const keyOwners = {};
  jsigs.verify(input, {
    checkKeyOwner: (owner, key, options, callback) => {
      // owner.publicKey can be a string or an array
      const publicKeys = [].concat(owner.publicKey);
      const trustedKeys = publicKeys.filter(
        k => typeof trustedSigners[k] === 'boolean');

      if(trustedSigners[owner.id] === undefined && trustedKeys.length === 0) {
        return callback(null, false);
      }
      keyOwners[key.id] = owner.id;
      callback(null, true);
    }
  }, (err, result) => {
    if(err) {
      return callback(new BedrockError(
        'An error occurred during signature verification.',
        'ValidationError', {
          httpStatusCode: 400,
          public: true
        }, err.toString()));
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
          input,
          trustedSigners,
          signatureCount,
          verifiedSignatures,
          keyResults,
          minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
        }));
    }
    // success
    callback(null, true);
  });
};
