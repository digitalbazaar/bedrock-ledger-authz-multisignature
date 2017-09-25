/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brValidator = require('bedrock-ledger-validator-signature');
const mockData = require('./mock.data');

describe('mustValidateEvent API', () => {
  describe('WebLedgerConfigurationEvent validator', () => {
    it('should return true on a WebLedgerConfigurationEvent event', done => {
      const event = mockData.ledgers.alpha.config;
      const testConfig =
        mockData.ledgers.alpha.config.input[0].eventValidator[1];
      brValidator.mustValidateEvent(event, testConfig, (err, result) => {
        should.not.exist(err);
        should.exist(result);
        result.should.be.a('boolean');
        result.should.be.true;
        done();
      });
    });
    it('should return false on a WebLedgerEvent event', done => {
      const event = mockData.events.alpha;
      const testConfig =
        mockData.ledgers.alpha.config.input[0].eventValidator[1];
      brValidator.mustValidateEvent(event, testConfig, (err, result) => {
        should.not.exist(err);
        should.exist(result);
        result.should.be.a('boolean');
        result.should.be.false;
        done();
      });
    });
  });
  describe('WebLedgerEvent validator', () => {
    it('should return true on a WebLedgerEvent event', done => {
      const event = mockData.events.alpha;
      const testConfig =
        mockData.ledgers.alpha.config.input[0].eventValidator[0];
      brValidator.mustValidateEvent(event, testConfig, (err, result) => {
        should.not.exist(err);
        should.exist(result);
        result.should.be.a('boolean');
        result.should.be.true;
        done();
      });
    });
    it('should return false on a WebLedgerConfigurationEvent event', done => {
      const event = mockData.ledgers.alpha.config;
      const testConfig =
        mockData.ledgers.alpha.config.input[0].eventValidator[0];
      brValidator.mustValidateEvent(event, testConfig, (err, result) => {
        should.not.exist(err);
        should.exist(result);
        result.should.be.a('boolean');
        result.should.be.false;
        done();
      });
    });
  });
});
