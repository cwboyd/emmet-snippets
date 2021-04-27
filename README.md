# emmet-snippets

## Overview

Shared emmet snippets for use by editors, inter alia, VS code.

## Requirements

You must have openssl and curl installed and in the path.

## Modifying

Edit 'source.json'.  If the value of a snippet is of type object, that object must contain 2 values: source and template

* source is the URL the script or stylesheet can be obtained at.
* template will become the output, with the following 'variables' expanded:

  * $url - the URL specified in the object value, e.g. the value for "source"
  * $sri - the calculated SRI value

Then run `node generate.js`.  The snippets.json file should be updated.


