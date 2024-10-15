import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { generateCards } from '@/helpers/generateCards';
import { Card } from '@/types';
import blackCards from '../../../../public/black.json';
import whiteCards from '../../../../public/white.json';


export async function GET() {
  const directoryPath = path.join(process.cwd(), 'cards'); // Assuming your .txt files are in the 'cards' folder
  const files = fs.readdirSync(directoryPath);

  return NextResponse.json([...blackCards, ...whiteCards]);
}
