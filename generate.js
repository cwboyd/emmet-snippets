
const fs = require('fs');
const child_process = require('child_process');
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

            // Calculate the SRI using openssl.  You must have openssl and curl installed.
            let command = `curl -s ${value.source} | openssl dgst -sha512 -binary | openssl base64 -A`;
            let sri = process = child_process
              .execSync(command, errorRethrower)
              .toString();

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


