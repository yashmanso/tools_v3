import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { surveyQuestions } from '@/app/lib/survey-questions';

// Force dynamic rendering since we're writing to file system
export const dynamic = 'force-dynamic';

// GitHub API configuration
const GITHUB_OWNER = 'yashmanso';
const GITHUB_REPO = 'tools_v3';
const GITHUB_BRANCH = 'main';
const SURVEY_DIR = 'survey';

// Create a map of question IDs to question text
function getQuestionTextMap() {
  const map: Record<string, string> = {};
  
  const processQuestion = (q: any) => {
    map[q.id] = q.text;
    if (q.subQuestions) {
      q.subQuestions.forEach((sq: any) => processQuestion(sq));
    }
    if (q.conditional?.question) {
      processQuestion(q.conditional.question);
    }
  };
  
  surveyQuestions.forEach(processQuestion);
  return map;
}

// Save to GitHub using GitHub API
async function saveToGitHub(fileName: string, fileContent: Buffer): Promise<boolean> {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.warn('GITHUB_TOKEN not set, cannot save to GitHub');
    return false;
  }

  try {
    const filePath = `${SURVEY_DIR}/${fileName}`;
    const base64Content = fileContent.toString('base64');
    
    // Get the current SHA of the file if it exists (for updates)
    // For new files, we'll create them
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    
    // Check if file exists
    let sha: string | undefined;
    try {
      const checkResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (checkResponse.ok) {
        const fileData = await checkResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist, that's fine - we'll create it
    }

    // Create or update the file
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add survey response: ${fileName}`,
        content: base64Content,
        branch: GITHUB_BRANCH,
        ...(sha && { sha }), // Include SHA if updating existing file
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    return false;
  }
}

// Save to local file system (for development)
async function saveToLocal(fileName: string, fileContent: Buffer): Promise<string | null> {
  try {
    const surveyDir = join(process.cwd(), 'survey');
    
    // Ensure survey directory exists
    if (!existsSync(surveyDir)) {
      await mkdir(surveyDir, { recursive: true });
    }

    const filePath = join(surveyDir, fileName);
    await writeFile(filePath, fileContent);
    
    return filePath;
  } catch (error) {
    console.error('Error saving to local file system:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `survey-results-${timestamp}.xlsx`;

    // Get question text map
    const questionTextMap = getQuestionTextMap();

    // Prepare data for Excel
    // Flatten the data structure for better Excel readability
    const flattenedData: Record<string, any> = {
      'Submission Date': new Date().toISOString(),
      'Timestamp': timestamp,
    };

    // Process each question response
    Object.keys(data).forEach(key => {
      const questionText = questionTextMap[key] || key;
      const value = data[key];
      let formattedValue = '';
      
      if (Array.isArray(value)) {
        // Multiple choice - join with semicolon
        formattedValue = value.join('; ');
      } else if (typeof value === 'object' && value !== null) {
        // Object with text inputs (like "Other" options) or structured data
        if (value.selected && Array.isArray(value.selected)) {
          // New format: { selected: [...], optionValue: 'text' }
          const parts: string[] = value.selected;
          Object.keys(value).forEach(subKey => {
            if (subKey !== 'selected' && typeof value[subKey] === 'string' && value[subKey].trim()) {
              parts.push(`${subKey}: ${value[subKey]}`);
            }
          });
          formattedValue = parts.join('; ');
        } else {
          // Old format or simple object
          const parts: string[] = [];
          Object.keys(value).forEach(subKey => {
            if (typeof value[subKey] === 'string') {
              parts.push(`${subKey}: ${value[subKey]}`);
            } else {
              parts.push(`${subKey}: ${value[subKey]}`);
            }
          });
          formattedValue = parts.join(' | ');
        }
      } else {
        // Simple value
        formattedValue = value?.toString() || '';
      }
      
      // Use question text as the column header
      flattenedData[questionText] = formattedValue;
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet([flattenedData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Responses');

    // Convert to buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Try to save to GitHub first (for production), fallback to local (for development)
    const isProduction = process.env.VERCEL === '1';
    let saved = false;
    let savedPath = '';

    if (isProduction) {
      // In production, save to GitHub
      saved = await saveToGitHub(fileName, excelBuffer);
      if (saved) {
        savedPath = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${SURVEY_DIR}/${fileName}`;
      }
    } else {
      // In development, save to local file system
      const localPath = await saveToLocal(fileName, excelBuffer);
      if (localPath) {
        saved = true;
        savedPath = localPath;
      }
    }

    if (!saved) {
      throw new Error('Failed to save survey response');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Survey submitted successfully',
      filePath: savedPath,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error saving survey:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save survey response' 
      },
      { status: 500 }
    );
  }
}
