/*
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const brValidator = require('bedrock-ledger-validator-signature');
const jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);

const mockData = require('./mock.data');

describe('validateConfiguration API', () => {
  it('validates a proper validator config', done => {
    const testConfig =
      mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0];
    brValidator.validateConfiguration({validatorConfig: testConfig}, err => {
      should.not.exist(err);
      done();
    });
  });
  it('returns ValidationError on missing approvedSigner', done => {
    const testConfig = bedrock.util.clone(
      mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0]);
    delete testConfig.approvedSigner;
    brValidator.validateConfiguration({validatorConfig: testConfig}, err => {
      should.exist(err);
      err.name.should.equal('ValidationError');
      done();
    });
  });
  it('returns ValidationError on missing minimumSignaturesRequired', done => {
    const testConfig = bedrock.util.clone(
      mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0]);
    delete testConfig.minimumSignaturesRequired;
    brValidator.validateConfiguration({validatorConfig: testConfig}, err => {
      should.exist(err);
      err.name.should.equal('ValidationError');
      done();
    });
  });
});
