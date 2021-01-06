/*
 * Copyright (c) 2017-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'; 

const config = require('bedrock').config;
const path = require('path');

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// MongoDB
config.mongodb.name = 'bedrock_ledger_validator_signature_test';
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];
