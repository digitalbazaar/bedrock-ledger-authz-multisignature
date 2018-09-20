/*
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brValidator = require('bedrock-ledger-validator-signature');
const mockData = require('./mock.data');

describe('mustValidate API', () => {
  describe('ledgerConfigurationValidator', () => {
    it('should return true on a WebLedgerConfiguration', done => {
      const ledgerConfiguration = mockData.ledgerConfigurations.alpha;
      const testConfig =
        mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0];
      brValidator.mustValidate(
        ledgerConfiguration, testConfig, (err, result) => {
          should.not.exist(err);
          should.exist(result);
          result.should.be.a('boolean');
          result.should.be.true;
          done();
        });
    });
    it('should return false on an operation', done => {
      const operation = mockData.operations.alpha;
      const testConfig =
        mockData.ledgerConfigurations.alpha.ledgerConfigurationValidator[0];
      brValidator.mustValidate(operation, testConfig, (err, result) => {
        should.not.exist(err);
        should.exist(result);
        result.should.be.a('boolean');
        result.should.be.false;
        done();
      });
    });
  });
  describe('operationValidator', () => {
    it('should return true on an operation', done => {
      const operation = mockData.operations.alpha;
      const testConfig =
        mockData.ledgerConfigurations.alpha.operationValidator[0];
      brValidator.mustValidate(operation, testConfig, (err, result) => {
        should.not.exist(err);
        should.exist(result);
        result.should.be.a('boolean');
        result.should.be.true;
        done();
      });
    });
    it('should return false on a WebLedgerConfiguration', done => {
      const ledgerConfiguration = mockData.ledgerConfigurations.alpha;
      const testConfig =
        mockData.ledgerConfigurations.alpha.operationValidator[0];
      brValidator.mustValidate(
        ledgerConfiguration, testConfig, (err, result) => {
          should.not.exist(err);
          should.exist(result);
          result.should.be.a('boolean');
          result.should.be.false;
          done();
        });
    });
  });
});
