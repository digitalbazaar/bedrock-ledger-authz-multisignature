/*!
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brLedgerNode = require('bedrock-ledger-node');
const jsigs = require('jsonld-signatures')();
const brDidClient = require('bedrock-did-client');
const {promisify} = require('util');
const validate = promisify(require('bedrock-validation').validate);
const {callbackify, BedrockError} = bedrock.util;

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
module.exports = api;

api.mustValidate = callbackify(async (input, validatorConfig, options) => {
  await api.validateConfiguration(validatorConfig);
  if(!(input && typeof input === 'object')) {
    return false;
  }
  if(validatorConfig.validatorFilter &&
    !validatorConfig.validatorFilter.some(f =>
      f.type === 'ValidatorFilterByType' &&
      f.validatorFilterByType.includes(input.type))) {
    return false;
  }
  return true;
});

api.validateConfiguration = callbackify(async (validatorConfig, options) => {
  return validate('ledger-validator-signature-config', validatorConfig);
});

api.validate = callbackify(async (input, validatorConfig, options) => {
  const trustedSigners = {};
  validatorConfig.approvedSigner.forEach(s => trustedSigners[s] = false);

  // FIXME: only support `proof`
  const signatureCount = (input.signature) ?
    [].concat(input.signature).length :
    [].concat(input.proof).length;
  // no need to proceed if total signatures do not meet minimum requirements
  if(signatureCount < validatorConfig.minimumSignaturesRequired) {
    throw new BedrockError(
      'The signature requirements have not been met.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true,
        input,
        signatureCount,
        minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
      });
  }

  const keyOwners = {};
  let result;
  try {
    result = await jsigs.verify(input, {
      checkKeyOwner: async (owner, key) => {
        // owner.publicKey can be a string or an array
        const publicKeys = [].concat(owner.publicKey);
        const trustedKeys = publicKeys.filter(
          k => typeof trustedSigners[k] === 'boolean');

        if(trustedSigners[owner.id] === undefined && trustedKeys.length === 0) {
          return false;
        }
        keyOwners[key.id] = owner.id;
        return true;
      }
    });
  } catch(err) {
    throw new BedrockError(
      'An error occurred during signature verification.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true
      }, err);
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
    throw new BedrockError(
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
      });
  }
  // success
  return true;
});
