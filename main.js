const path = require("path");
const IOhandler = require("./IOhandler");

const zipFilePath = path.join(__dirname, 'myfile.zip');
const outputPath = path.join(__dirname, 'unzipped');
const grayScalePath = path.join(__dirname, 'grayscaled');


const startTime = process.hrtime();
const startMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;


IOhandler.unzip(zipFilePath, outputPath)
  .then(() => {
    console.log('Unzipping complete.');

 
    const pngFiles = IOhandler.readDir(outputPath);
    console.log(`Found ${pngFiles.length} PNG files.`);


    pngFiles.forEach((filePath, index) => {
      const grayScaleOutputPath = path.join(grayScalePath, `image${index}.png`);
      IOhandler.grayScale(filePath, grayScaleOutputPath);
    });

    console.log('Grayscaling complete.');

    
    const elapsedTime = process.hrtime(startTime);
    const elapsedMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024 - startMemoryUsage;
    console.log(`Execution time: ${elapsedTime[0]}s ${elapsedTime[1] / 1000000}ms`);
    console.log(`Memory usage: ${elapsedMemoryUsage.toFixed(2)} MB`);
  })
  .catch(error => {
    console.error(`Error: ${error}`);
  });
