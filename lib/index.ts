#!/usr/bin/env node

/// <reference path="./typings.d.ts" />

/**
 * Project root file
 */

import main from './main'

const [type, tag] = process.argv.slice(2)

main(type, tag)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(-1)
  })