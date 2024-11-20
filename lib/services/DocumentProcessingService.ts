import { createWorker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { prisma } from '../db';
import { ApiIntegrationManager } from '../api/ApiIntegrationManager';
import { TaxKnowledgeBase } from '../ai/TaxKnowledgeBase';

interface ExtractedFormData {
  formType: string;
  year: number;
  fields: Record<string, string | number>;
}

export class DocumentProcessingService {
  private static instance: DocumentProcessingService;
  private apiManager: ApiIntegrationManager;
  private knowledgeBase: TaxKnowledgeBase;

  private constructor() {
    this.apiManager = ApiIntegrationManager.getInstance();
    this.knowledgeBase = TaxKnowledgeBase.getInstance();
  }

  public static getInstance(): DocumentProcessingService {
    if (!DocumentProcessingService.instance) {
      DocumentProcessingService.instance = new DocumentProcessingService();
    }
    return DocumentProcessingService.instance;
  }

  public async processDocument(
    fileBuffer: Buffer,
    fileName: string,
    userId: string
  ): Promise<ExtractedFormData> {
    try {
      // Determine file type and processing method
      if (fileName.endsWith('.pdf')) {
        return await this.processPDF(fileBuffer);
      } else {
        return await this.processImage(fileBuffer);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  private async processPDF(pdfBuffer: Buffer): Promise<ExtractedFormData> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const extractedData: Record<string, string | number> = {};
      
      fields.forEach(field => {
        const fieldName = field.getName();
        if (field.constructor.name === 'PDFTextField') {
          const textField = field as any;
          extractedData[fieldName] = textField.getText() || '';
        } else if (field.constructor.name === 'PDFCheckBox') {
          const checkBox = field as any;
          extractedData[fieldName] = checkBox.isChecked();
        }
      });

      // Identify form type and year
      const formType = await this.identifyFormType(extractedData);
      const year = await this.extractYear(extractedData);

      return {
        formType,
        year,
        fields: extractedData
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }

  private async processImage(imageBuffer: Buffer): Promise<ExtractedFormData> {
    try {
      // Optimize image for OCR
      const processedBuffer = await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();

      // Perform OCR
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(processedBuffer);
      await worker.terminate();

      // Extract structured data from OCR text
      const extractedData = await this.parseOCRText(text);
      
      return extractedData;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  private async parseOCRText(text: string): Promise<ExtractedFormData> {
    // Use AI to extract structured data from OCR text
    const completion = await this.apiManager.openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Extract tax form information from the following OCR text. Return a JSON object with formType, year, and relevant fields."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const extractedData = JSON.parse(completion.data.choices[0].message?.content || '{}');
    return {
      formType: extractedData.formType || 'unknown',
      year: extractedData.year || new Date().getFullYear(),
      fields: extractedData.fields || {}
    };
  }

  private async identifyFormType(fields: Record<string, string | number>): Promise<string> {
    // Use field patterns to identify form type
    const patterns = {
      'w2': ['wages', 'salary', 'compensation', 'employer'],
      '1099': ['nonemployee', 'independent contractor', 'miscellaneous'],
      '1040': ['income tax return', 'filing status', 'exemptions']
    };

    const fieldString = JSON.stringify(fields).toLowerCase();
    
    for (const [formType, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => fieldString.includes(keyword))) {
        return formType;
      }
    }

    return 'unknown';
  }

  private async extractYear(fields: Record<string, string | number>): Promise<number> {
    const currentYear = new Date().getFullYear();
    const fieldString = JSON.stringify(fields);
    
    // Look for year patterns (YYYY) in fields
    const yearMatch = fieldString.match(/20\d{2}/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      if (year <= currentYear && year >= currentYear - 5) {
        return year;
      }
    }

    return currentYear - 1; // Default to previous year if no valid year found
  }

  public async validateExtractedData(data: ExtractedFormData): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      // Get relevant tax rules for the form type
      const rules = await this.knowledgeBase.getRelevantRules(data.formType);
      
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields
      const requiredFields = this.getRequiredFields(data.formType);
      requiredFields.forEach(field => {
        if (!data.fields[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      });

      // Validate field formats and values
      Object.entries(data.fields).forEach(([field, value]) => {
        if (!this.validateFieldFormat(field, value)) {
          errors.push(`Invalid format for field: ${field}`);
        }
        if (!this.validateFieldValue(field, value)) {
          warnings.push(`Unusual value for field: ${field}`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      console.error('Error validating extracted data:', error);
      throw error;
    }
  }

  private getRequiredFields(formType: string): string[] {
    // Define required fields for each form type
    const requiredFieldsMap: Record<string, string[]> = {
      'w2': ['employerEIN', 'employerName', 'employeeSSN', 'wages'],
      '1099': ['payerTIN', 'payerName', 'recipientTIN', 'amount'],
      '1040': ['ssn', 'filingStatus', 'totalIncome']
    };

    return requiredFieldsMap[formType] || [];
  }

  private validateFieldFormat(field: string, value: string | number): boolean {
    // Define format validation rules
    const formatRules: Record<string, RegExp> = {
      'ssn': /^\d{3}-?\d{2}-?\d{4}$/,
      'ein': /^\d{2}-?\d{7}$/,
      'zip': /^\d{5}(-\d{4})?$/,
      'phone': /^\d{3}-?\d{3}-?\d{4}$/,
      'email': /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    if (formatRules[field]) {
      return formatRules[field].test(String(value));
    }

    return true;
  }

  private validateFieldValue(field: string, value: string | number): boolean {
    // Define value validation rules
    const valueRules: Record<string, (val: any) => boolean> = {
      'wages': (val: number) => val >= 0 && val < 10000000,
      'year': (val: number) => val >= 2000 && val <= new Date().getFullYear(),
      'age': (val: number) => val >= 0 && val <= 120
    };

    if (valueRules[field]) {
      return valueRules[field](value);
    }

    return true;
  }

  public async saveProcessedDocument(
    userId: string,
    data: ExtractedFormData,
    originalFileName: string
  ): Promise<void> {
    try {
      await prisma.document.create({
        data: {
          userId,
          type: data.formType,
          year: data.year,
          fileName: originalFileName,
          content: data.fields as any,
          status: 'PROCESSED',
          processingDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error saving processed document:', error);
      throw error;
    }
  }
}
