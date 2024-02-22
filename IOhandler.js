const yauzl = require('yauzl-promise');
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const unzip = async (zipPath, outputPath) => {
  try {
    console.log(`Zip Path: ${zipPath}`);
    console.log(`Output Path: ${outputPath}`);
    
   
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const zipfile = await yauzl.open(zipPath);
    const entries = await zipfile.readEntries();
    for (const entry of entries) {
      if (entry.filename && path.extname(entry.filename) === '.png') {
        console.log(`Extracting ${entry.filename}`);
        const fileOutputPath = path.join(outputPath, entry.filename);
        
      
        const dir = path.dirname(fileOutputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (!entry.isDirectory) {
          try {
            const stream = await entry.openReadStream();
            if (fileOutputPath) {
              const writeStream = fs.createWriteStream(fileOutputPath);
              stream.pipe(writeStream);
              await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
              });
            } else {
              console.error(`Output path is undefined for entry ${entry.filename}`);
            }
          } catch (error) {
            console.error(`Error creating read stream for entry ${entry.filename}: ${error}`);
          }
        }
      } else {
        console.error(`${entry.filename} is undefined or not a .png file`);
      }
    }
    console.log("Extraction operation complete");
  } catch (error) {
    console.error(`Error during extraction: ${error}`);
  }
};
const readDir = (dir) => {
  let result = [];
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      result = result.concat(readDir(filePath));
    } else if (path.extname(filePath) === '.png') {
      result.push(filePath);
    }
  });
  return result;
};

const grayScale = (pathIn, pathOut) => {
  fs.createReadStream(pathIn)
    .pipe(new PNG())
    .on('parsed', function() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;

    
          const gray = (this.data[idx] + this.data[idx+1] + this.data[idx+2]) / 3;

          this.data[idx] = gray;
          this.data[idx+1] = gray;
          this.data[idx+2] = gray;
        }
      }

      this.pack().pipe(fs.createWriteStream(pathOut));
    });
};


module.exports = {
  unzip,
  readDir,
  grayScale
};
