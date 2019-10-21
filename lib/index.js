/*!
 * Copyright (c) 2017-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brLedgerNode = require('bedrock-ledger-node');
const {documentLoader} = require('bedrock-jsonld-document-loader');
const jsigs = require('jsonld-signatures');
const {validate} = require('bedrock-validation');
const {util: {callbackify, BedrockError}} = bedrock;
const {
  purposes: {AssertionProofPurpose},
  suites: {Ed25519Signature2018, RsaSignature2018},
} = jsigs;

require('./config');

const api = {};
module.exports = api;

bedrock.events.on('bedrock.start', () =>
  brLedgerNode.use('SignatureValidator2017', {api, type: 'validator'}));

api.mustValidate = callbackify(async ({validatorInput, validatorConfig}) => {
  const result = await api.validateConfiguration({validatorConfig});
  if(!result.valid) {
    throw result.error;
  }
  if(!(validatorInput && typeof validatorInput === 'object')) {
    return false;
  }
  if(validatorConfig.validatorFilter &&
    !validatorConfig.validatorFilter.some(f =>
      f.type === 'ValidatorFilterByType' &&
      f.validatorFilterByType.includes(validatorInput.type))) {
    return false;
  }
  return true;
});

api.validateConfiguration = callbackify(async ({validatorConfig}) => {
  return validate('ledger-validator-signature-config', validatorConfig);
});

api.validate = callbackify(async ({validatorInput, validatorConfig}) => {
  const trustedSigners = {};
  validatorConfig.approvedSigner.forEach(s => trustedSigners[s] = false);

  // FIXME: only support `proof`
  const signatureCount = (validatorInput.signature) ?
    [].concat(validatorInput.signature).length :
    [].concat(validatorInput.proof).length;
  // no need to proceed if total signatures do not meet minimum requirements
  if(signatureCount < validatorConfig.minimumSignaturesRequired) {
    const error = new BedrockError(
      'The signature requirements have not been met.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true,
        validatorInput,
        signatureCount,
        minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
      });
    return {error, valid: false};
  }

  const keyOwners = {};
  let result;
  try {
    result = await jsigs.verify(validatorInput, {
      documentLoader,
      purpose: new AssertionProofPurpose(),
      suite: [new Ed25519Signature2018(), new RsaSignature2018()]
      // checkKeyOwner: async (owner, key) => {
      //   // owner.publicKey can be a string or an array
      //   const publicKeys = [].concat(owner.publicKey);
      //   const trustedKeys = publicKeys.filter(
      //     k => typeof trustedSigners[k] === 'boolean');
      //
      //   if(trustedSigners[owner.id] === undefined && trustedKeys.length === 0) {
      //     return false;
      //   }
      //   keyOwners[key.id] = owner.id;
      //   return true;
      // }
    });
  } catch(err) {
    const error = new BedrockError(
      'An error occurred during signature verification.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true
      }, err);
    return {error, valid: false};
  }

  // FIXME: what functionality should be provided here
  return {
    valid: result.verified,
    error: result.error
  };

  /*
  const keyResults = result.keyResults;
  // trustedSigner may be a publicKey or an owner
  keyResults.filter(k => k.verified).forEach(k => {
    if(trustedSigners[k.publicKey] === false) {
      trustedSigners[k.publicKey] = true;
    } else if(trustedSigners[keyOwners[k.publicKey]] === false) {
      trustedSigners[keyOwners[k.publicKey]] = true;
    }
  });
  const verifiedSignatures = Object.values(trustedSigners)
    .filter(s => s).length;
  if(verifiedSignatures < validatorConfig.minimumSignaturesRequired) {
    const error = new BedrockError(
      'The signature requirements have not been met.',
      'ValidationError', {
        httpStatusCode: 400,
        public: true,
        validatorInput,
        trustedSigners,
        signatureCount,
        verifiedSignatures,
        keyResults,
        minimumSignaturesRequired: validatorConfig.minimumSignaturesRequired
      });
    return {error, valid: false};
  }
  // success
  return {valid: true};
  */
});
