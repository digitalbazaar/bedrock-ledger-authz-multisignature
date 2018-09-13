/*!
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {schemas} = require('bedrock-validation');

const schema = {
  title: 'Bedrock Ledger Signature Validator Config',
  required: [
    'approvedSigner', 'minimumSignaturesRequired', 'type', 'validatorFilter'
  ],
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['SignatureValidator2017']
    },
    validatorFilter: {
      title: 'Type Filter',
      type: 'array',
      items: {
        required: ['type', 'validatorFilterByType'],
        type: 'object',
        properties: {
          type: {
            type: 'string',
          },
          validatorFilterByType: {
            type: 'array',
            items: {
              type: 'string'
            },
          }
        },
        additionalProperties: false
      },
    },
    minimumSignaturesRequired: {
      type: 'integer'
    },
    approvedSigner: {
      type: 'array',
      items: schemas.url()
    }
  },
  additionalProperties: false
};

module.exports = extend => {
  if(extend) {
    return bedrock.util.extend(true, bedrock.util.clone(schema), extend);
  }
  return schema;
};
