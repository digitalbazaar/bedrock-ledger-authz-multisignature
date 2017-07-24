/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */

'use strict';

const bedrock = require('bedrock');
const brValidator = require('bedrock-ledger-validator-signature');
const jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);

const mockData = require('./mock.data');

describe('validateConfiguration API', () => {
  it('validates a proper config', done => {
    const testConfig = mockData.ledgers.alpha.config.input[0].eventValidator[0];
    brValidator.validateConfiguration(testConfig, err => {
      should.not.exist(err);
      done();
    });
  });
  it('returns ValidationError on missing approvedSigner', done => {
    const testConfig = bedrock.util.clone(
      mockData.ledgers.alpha.config.input[0].eventValidator[0]);
    delete testConfig.approvedSigner;
    brValidator.validateConfiguration(testConfig, err => {
      should.exist(err);
      err.name.should.equal('ValidationError');
      done();
    });
  });
  it('returns ValidationError on missing minimumSignaturesRequired', done => {
    const testConfig = bedrock.util.clone(
      mockData.ledgers.alpha.config.input[0].eventValidator[0]);
    delete testConfig.minimumSignaturesRequired;
    brValidator.validateConfiguration(testConfig, err => {
      should.exist(err);
      err.name.should.equal('ValidationError');
      done();
    });
  });
});
