import { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

interface Card {
  colour: string;
  text: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Card[]>) {
  const directoryPath = path.join(process.cwd(), 'cards'); // Assuming your .txt files are in the 'cards' folder
  const files = fs.readdirSync(directoryPath);
  const cards: Card[] = [];

  files.forEach(file => {
    if (file.endsWith('.txt')) {
      const filePath = path.join(directoryPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');

      lines.forEach(line => {
        const columns = line.split('\t');
        if (columns.length >= 2) {
          const colour = columns[0];
          const text = columns[1];
          cards.push({ colour, text });
        }
      });
    }
  });

  res.status(200).json(cards);
}
