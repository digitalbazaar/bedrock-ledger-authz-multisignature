/*
 * Copyright (c) 2017-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {callbackify} = require('util');
const {documentLoader} = require('bedrock-jsonld-document-loader');
const jsigs = require('jsonld-signatures');
const {
  purposes: {AssertionProofPurpose},
  suites: {RsaSignature2018},
  RSAKeyPair
} = jsigs;

exports.signDocument = callbackify(async ({creator, doc, privateKeyPem}) => {
  return jsigs.sign(doc, {
    documentLoader,
    // FIXME: is this the right purpose?
    purpose: new AssertionProofPurpose(),
    suite: new RsaSignature2018({
      creator,
      key: new RSAKeyPair({privateKeyPem})
    }),
  });
});
