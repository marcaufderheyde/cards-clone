import * as fs from 'fs';
import * as path from 'path';

interface Card {
  colour: string;
  text: string;
}

function processTxtFilesInDirectory(directoryPath: string): Card[] {
  const files = fs.readdirSync(directoryPath);
  const cards: Card[] = [];

  files.forEach(file => {
    if (file.endsWith('.txt')) {
      const filePath = path.join(directoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Split file content into lines
      const lines = fileContent.split('\n');

      lines.forEach(line => {
        // Split each line by tab or space, assuming tab-separated values
        const columns = line.split('\t');

        if (columns.length >= 2) {
          const colour = columns[0];   // The first column is the colour
          const text = columns[1];     // The second column is the text

          cards.push({
            colour,
            text
          });
        }
      });
    }
  });

  return cards;
}

// Example usage
const directoryPath = './';  // Use the current directory
const cardList = processTxtFilesInDirectory(directoryPath);
console.log(cardList);
