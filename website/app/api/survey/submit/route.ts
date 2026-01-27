import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { surveyQuestions } from '@/app/lib/survey-questions';

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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Path to survey folder
    const surveyDir = join(process.cwd(), '..', 'survey');
    const excelFilePath = join(surveyDir, `survey-results-${timestamp}.xlsx`);

    // Ensure survey directory exists
    if (!existsSync(surveyDir)) {
      await mkdir(surveyDir, { recursive: true });
    }

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

    // Write to file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await writeFile(excelFilePath, excelBuffer);

    return NextResponse.json({ 
      success: true, 
      message: 'Survey submitted successfully',
      filePath: excelFilePath 
    });
  } catch (error) {
    console.error('Error saving survey:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save survey response' },
      { status: 500 }
    );
  }
}
