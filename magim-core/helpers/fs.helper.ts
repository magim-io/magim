import fs from "fs";
import path from "path";

const readFile = async ({
  filePath,
}: {
  filePath: string;
}): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, filePath), (err, buffer) => {
      if (err) {
        reject(err.message);
      }
      resolve(buffer);
    });
  });
};

export { readFile };
