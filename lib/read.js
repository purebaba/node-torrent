const fs       = require('fs');
const BStream  = require('bncode').Stream;

const schema  = require('./schema');
const Torrent = require('./torrent');


/**
 * Read torrent data.
 *
 * @param {String|ReadableStream} file File where the torrent
 *   resides, can be local file, remote, or a readable stream.
 * @param {Function(!Error, Torrent)} callback
 * @param {Boolean} validate validate or not schema
 * @param {ReadableStream}
 */
module.exports = (file, validate = true, callback) => {
  if (typeof validate === 'function') {
    callback = validate;
    validate = true
  }
  if (!callback) {
    callback = () => {};
  }

  var rs = typeof file === 'string' ? fs.createReadStream(file) : file;
  var bstream = new BStream();
  rs.pipe(bstream);

  bstream.on('error', (err) => {
    if (rs.hasOwnProperty('fd')) {
      fs.close(rs.fd);
    }
    callback(err);
  });

  bstream.on('data', (result) => {
    if (validate) {
      schema.validate(result, callback);
      return;
    }
    callback(null, new Torrent(result));
  });

  return rs;
};
