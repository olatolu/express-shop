const fs = require("fs");

const deleteFile = (filePath) => {

  while (filePath.charAt(0) === "/") {
    filePath = filePath.substring(1);
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
