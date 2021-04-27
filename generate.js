
const fs = require('fs');
const child_process = require('child_process');
const fetch = require('sync-fetch');
const sha512 = require('js-sha512').sha512;
const buffer = require('buffer');

let errorRethrower = (error) => { if (!!error) throw(error); }

try
{
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

            // Then, we calcuate a SHA512 hash on the fetch resource.  This returns an array,
            // so that we can convert it to a Buffer, which has a handle base64 conversion on
            // it.  All the while, we treat the calculated hash bytes as binary.
            let sha512_digest = sha512.digest(downloadedData);
            let sha512_buffer = Buffer.from(sha512_digest, 'binary');
            let sri = sha512_buffer.toString('base64');

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
    fs.writeFile('snippets.json', JSON.stringify(sources, null, 2)+"\n\n", errorRethrower);
  });
}
catch (e)
{
  console.log(e);
}


