import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const VIEW_COUNTS_FILE = path.join(process.cwd(), 'data', 'view-counts.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read view counts from file
function readViewCounts(): Record<string, number> {
  ensureDataDirectory();
  
  if (!fs.existsSync(VIEW_COUNTS_FILE)) {
    return {};
  }
  
  try {
    const content = fs.readFileSync(VIEW_COUNTS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Validate that it's an object with string keys and number values
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      const valid: Record<string, number> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof key === 'string' && typeof value === 'number' && value >= 0) {
          valid[key] = value;
        }
      }
      return valid;
    }
    
    return {};
  } catch (error) {
    console.error('Error reading view counts file:', error);
    return {};
  }
}

// Write view counts to file
function writeViewCounts(counts: Record<string, number>): void {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(VIEW_COUNTS_FILE, JSON.stringify(counts, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing view counts file:', error);
    throw error;
  }
}

// GET: Retrieve view counts
export async function GET(request: NextRequest) {
  try {
    const counts = readViewCounts();
    return NextResponse.json({ counts }, { status: 200 });
  } catch (error) {
    console.error('Error getting view counts:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve view counts' },
      { status: 500 }
    );
  }
}

// POST: Increment view count for a resource
export async function POST(request: NextRequest) {
  try {
    const { category, slug } = await request.json();
    
    // Validate input
    if (!category || !slug || typeof category !== 'string' || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. category and slug are required.' },
        { status: 400 }
      );
    }
    
    const counts = readViewCounts();
    const key = `${category}/${slug}`;
    
    // Increment the count (or set to 1 if it doesn't exist)
    counts[key] = (counts[key] || 0) + 1;
    
    writeViewCounts(counts);
    
    return NextResponse.json(
      { success: true, count: counts[key] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
