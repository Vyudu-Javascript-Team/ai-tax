import { Configuration, OpenAIApi } from 'openai';
import { prisma } from '../db';

interface TaxRule {
  category: string;
  description: string;
  applicability: string[];
  exceptions: string[];
  citations: string[];
}

interface TaxGuidance {
  topic: string;
  guidance: string;
  lastUpdated: Date;
  source: string;
}

export class TaxKnowledgeBase {
  private openai: OpenAIApi;
  private static instance: TaxKnowledgeBase;
  private taxRules: Map<string, TaxRule>;
  private taxGuidance: Map<string, TaxGuidance>;

  private constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
    this.openai = new OpenAIApi(configuration);
    this.taxRules = new Map();
    this.taxGuidance = new Map();
    this.initializeKnowledgeBase();
  }

  public static getInstance(): TaxKnowledgeBase {
    if (!TaxKnowledgeBase.instance) {
      TaxKnowledgeBase.instance = new TaxKnowledgeBase();
    }
    return TaxKnowledgeBase.instance;
  }

  private async initializeKnowledgeBase() {
    await this.loadTaxRules();
    await this.loadTaxGuidance();
    await this.trainAIModel();
  }

  private async loadTaxRules() {
    try {
      const rules = await prisma.taxRule.findMany({
        include: {
          citations: true,
          exceptions: true,
        },
      });

      rules.forEach(rule => {
        this.taxRules.set(rule.id, {
          category: rule.category,
          description: rule.description,
          applicability: rule.applicability,
          exceptions: rule.exceptions.map(e => e.description),
          citations: rule.citations.map(c => c.reference),
        });
      });
    } catch (error) {
      console.error('Error loading tax rules:', error);
    }
  }

  private async loadTaxGuidance() {
    try {
      const guidance = await prisma.taxGuidance.findMany();
      guidance.forEach(g => {
        this.taxGuidance.set(g.id, {
          topic: g.topic,
          guidance: g.guidance,
          lastUpdated: g.lastUpdated,
          source: g.source,
        });
      });
    } catch (error) {
      console.error('Error loading tax guidance:', error);
    }
  }

  private async trainAIModel() {
    // Create a comprehensive training dataset
    const trainingData = this.generateTrainingData();
    
    // Fine-tune the model with tax-specific knowledge
    try {
      await this.openai.createFineTune({
        training_file: trainingData,
        model: 'gpt-4',
        suffix: 'tax-expert',
      });
    } catch (error) {
      console.error('Error training AI model:', error);
    }
  }

  private generateTrainingData(): any {
    const trainingExamples = [];

    // Convert tax rules to training examples
    this.taxRules.forEach(rule => {
      trainingExamples.push({
        prompt: `What are the rules for ${rule.category}?`,
        completion: `${rule.description} This applies to ${rule.applicability.join(', ')}. 
          Exceptions include: ${rule.exceptions.join(', ')}. 
          Sources: ${rule.citations.join(', ')}`,
      });
    });

    // Convert tax guidance to training examples
    this.taxGuidance.forEach(guidance => {
      trainingExamples.push({
        prompt: `What is the guidance on ${guidance.topic}?`,
        completion: `${guidance.guidance} 
          Last updated: ${guidance.lastUpdated}
          Source: ${guidance.source}`,
      });
    });

    return trainingExamples;
  }

  public async getRelevantRules(context: string): Promise<TaxRule[]> {
    const relevantRules: TaxRule[] = [];
    
    try {
      const embedding = await this.openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: context,
      });

      // Use embeddings to find relevant rules
      this.taxRules.forEach(rule => {
        // Implement similarity matching logic
        relevantRules.push(rule);
      });
    } catch (error) {
      console.error('Error getting relevant rules:', error);
    }

    return relevantRules;
  }

  public async getGuidance(topic: string): Promise<TaxGuidance | null> {
    try {
      const completion = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a tax expert providing guidance.' },
          { role: 'user', content: `What is the guidance for ${topic}?` }
        ],
      });

      const guidance = completion.data.choices[0].message?.content;
      if (guidance) {
        return {
          topic,
          guidance,
          lastUpdated: new Date(),
          source: 'AI Tax Expert System',
        };
      }
    } catch (error) {
      console.error('Error getting guidance:', error);
    }

    return null;
  }

  public async validateDeduction(deduction: {
    category: string;
    amount: number;
    description: string;
  }): Promise<{
    isValid: boolean;
    explanation: string;
    requiredDocuments: string[];
  }> {
    try {
      const relevantRules = await this.getRelevantRules(deduction.category);
      const completion = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a tax expert validating deductions. Consider these rules: ${JSON.stringify(relevantRules)}`,
          },
          {
            role: 'user',
            content: `Is this deduction valid: ${JSON.stringify(deduction)}?`,
          },
        ],
      });

      const response = completion.data.choices[0].message?.content;
      if (response) {
        const result = JSON.parse(response);
        return {
          isValid: result.isValid,
          explanation: result.explanation,
          requiredDocuments: result.requiredDocuments,
        };
      }
    } catch (error) {
      console.error('Error validating deduction:', error);
    }

    return {
      isValid: false,
      explanation: 'Unable to validate deduction',
      requiredDocuments: [],
    };
  }

  public async updateKnowledgeBase(newRules: TaxRule[], newGuidance: TaxGuidance[]) {
    try {
      // Update rules in database
      for (const rule of newRules) {
        await prisma.taxRule.create({
          data: {
            category: rule.category,
            description: rule.description,
            applicability: rule.applicability,
            exceptions: {
              create: rule.exceptions.map(e => ({ description: e })),
            },
            citations: {
              create: rule.citations.map(c => ({ reference: c })),
            },
          },
        });
      }

      // Update guidance in database
      for (const guidance of newGuidance) {
        await prisma.taxGuidance.create({
          data: {
            topic: guidance.topic,
            guidance: guidance.guidance,
            lastUpdated: guidance.lastUpdated,
            source: guidance.source,
          },
        });
      }

      // Reload knowledge base
      await this.initializeKnowledgeBase();
    } catch (error) {
      console.error('Error updating knowledge base:', error);
      throw error;
    }
  }
}
