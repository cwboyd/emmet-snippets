
const fs = require('fs');
const fetch = require('sync-fetch');
const crypto = require('crypto');

let errorRethrower = (error) => { if (!!error) throw(error); }

try
{
  if (!crypto || !crypto.getHashes) throw "crypto module is in this version of node!";

  // Check if sha512 is within crypto.getHashes()
  if (!crypto.getHashes().includes('sha512')) {
    throw `SHA-512 is unsupported by the crypto module in this version of node.\n\nSupported:\n\n${crypto.getHashes()}`;
  }

  fs.readFile('source.json', function(error,data) {
    errorRethrower(error);

    let sources = JSON.parse(data);
    Object.entries(sources).forEach( ([top_key,top_value]) => {
      Object.entries(top_value).forEach( ([mid_key, mid_value]) => {
        Object.entries(mid_value).forEach( ([key, value]) => {
          if (typeof value === "object")
          {
            if (!value.hasOwnProperty('template')) throw(`snippet '${key}' requires field template`);
            if (!value.hasOwnProperty('source')) throw(`snippet '${soure}' requires field template`);

            // Fetch the resource synchronously
            let downloadedData = fetch(value.source).buffer();

            // Then, we calcuate a SHA512 hash on the fetched resource (which is a Buffer).
            // When passing a Buffer into a crypto-module created hash, encoding is assumed to be raw
            // (and therefore encoding argument is ignored).  Producing a digest on the created
            // hash ends it, so we have to create a new one each time.  The output of this digest()
            // is a Buffer, so we call Buffer's special toString to convert to base64.
            let sri = crypto
              .createHash('sha512')
              .update(downloadedData)
              .digest()
              .toString('base64');

            // Expand template, replacing $url with the source and $sri with the hash value.
            let template = value
              .template
              .replace('$url', value.source)
              .replace('$sri', `sha512-${sri}`)
              ;
            console.log(`Calculated snippet '${key}' SRI ...`);

            // Expand template in object.
            sources[top_key][mid_key][key] = template;
          }
        });
      });
    });

    // Write object with expanded templates back out, respecting whitespace.
    fs.writeFile('snippets.json', JSON.stringify(sources, null, 2), errorRethrower);
  });
}
catch (e)
{
  console.log(e);
}


