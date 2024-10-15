import fs from 'fs';
import path from 'path';

interface Card {
  colour: string;
  text: string;
}

// Define the function that reads from .txt files and writes to JSON files
export function generateCards() {
  const directoryPath = path.join(process.cwd(), 'cards'); // Assuming your .txt files are in the 'cards' folder
  const blackCards: Card[] = [];
  const whiteCards: Card[] = [];

  // Read all files from the 'cards' folder
  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    if (file.endsWith('.txt')) {
      const filePath = path.join(directoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      // Process each line in the file
      lines.forEach(line => {
        const columns = line.split('\t'); // Assuming columns are tab-separated
        if (columns.length >= 2) {
          const colour = columns[0].trim();
          const text = columns[1].trim();

          // Add the card to the appropriate deck based on colour
          if (colour.toLowerCase() === 'black') {
            blackCards.push({ colour, text });
          } else if (colour.toLowerCase() === 'white') {
            whiteCards.push({ colour, text });
          }
        }
      });
    }
  });

  // Write the black cards to black.json
  const blackJsonPath = path.join(directoryPath, 'black.json');
  fs.writeFileSync(blackJsonPath, JSON.stringify(blackCards, null, 2), 'utf-8');
  console.log(`Black cards saved to ${blackJsonPath}`);

  // Write the white cards to white.json
  const whiteJsonPath = path.join(directoryPath, 'white.json');
  fs.writeFileSync(whiteJsonPath, JSON.stringify(whiteCards, null, 2), 'utf-8');
  console.log(`White cards saved to ${whiteJsonPath}`);
}

// Run the function when the script is executed
generateCards();
