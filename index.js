// Min value for confidence. (0 - 100)
const MIN_CONFIDENCE = 30;

// Import Tesseract for recognition
const Tesseract = require('tesseract.js');

// Import Fs for reading images
const Fs = require('fs');

// Counter for results.
const total = {
  fail: 0,
  pass: 0,
};

// Array to hold only the fails.
const fails = [];

// Timer for total test time.
const totalTime = Date.now();

// Async func wrapper.
( async _ => {
  // Read folders in Tests folder.
  // Folder names must be the 
  // serial number in images.
  const tests = Fs.readdirSync(__dirname + "/Tests");

  // Go into every test subdir. 
  for(let i = 0; i < tests.length; i++) {
    const currentDir = tests[i];

    const testPath = __dirname + "/Tests/";

    // Skip hidden directories.
    if(currentDir[0] === '.') continue;

    // Get files under subdir.
    const files = Fs.readdirSync(testPath + currentDir);
    
    // Iterate over files in subdir.
    for(let j = 0; j < files.length; j++) {
      const file = files[j];

      // Skip hidden files.
      if(file[0] === '.') continue;

      // Start timer.
      const start = Date.now();

      // Recognize text with ocr as the language.
      // This will use pre-trained ocr font data
      // from ocr.traineddata.
      const _result = await Tesseract.recognize(testPath + currentDir + "/" + file, {
        lang: 'ocr',
      });

      const result = _result.words
        // Filter low confident words.
        .filter(({ confidence }) => confidence > MIN_CONFIDENCE)

        // Filter words that don't contain 7 letters.
        .filter(({ text }) => 
          // Remove newline from words.
          text.replace('\n', '')
          
          // Check length
          .length === 7)

        // Extract text
        .map(({text}) => text)

        // Join words for final result.
        .join('-')

        // Log the result.
        console.log({
          "File Name": file,
          "Found Result": result,
          "Target Result": currentDir,
          "Status": result === currentDir 

            // Increment total pass.
            ? total.pass++ + 1

              // Log as passed.
              && "Passed" 

            // Increment total fail and log as failed.
            : total.fail++ + 1 

              // Push fail to fails array
              && fails.push({
                "File Name": file,
                "Found Result": result,
                "Target Result": currentDir,
              })
              
              // Log as failed
              && "Failed",
          "Time": Date.now() - start + "ms",
        });
    };
  }
})()

// Log general results.
.then( _ => console.log({
  ...total,
  "Total Time" : Date.now() - totalTime + "ms",
  fails,
}));
