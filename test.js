const sharp = require('sharp');
const Jimp = require('jimp');
// Input and output file paths
const inputFile = 'output.png';
const outputFile = 'output.ico';
const inputFilePath = 'output.png';
const outputFilePath = 'output.ico';
// Define the new width and height for the resized image
const newWidth = 512;
const newHeight = 512;

// Resize the image
// sharp(inputFile)
//   .resize(newWidth, newHeight)
//   .toFile(outputFile, (err) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log('Image resized successfully');
//     }
//   });

  const convertToIco = async () => {
    try {
      // Read the PNG image using sharp
      const image = sharp(inputFilePath);
      
      // Resize the image to 256x256 as ICO format requires this size
      const resizedImage = await image.resize(newWidth, newWidth).toBuffer();
  
      // Create a Jimp image from the resized buffer
      const jimpImage = await Jimp.read(resizedImage);
  
      // Save the Jimp image as ICO format
      await jimpImage.write(outputFilePath);
      
      console.log('Conversion successful!');
    } catch (error) {
      console.error('Error converting PNG to ICO:', error);
    }
  };
  
  convertToIco();
