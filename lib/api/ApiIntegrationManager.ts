import { Configuration, OpenAIApi } from 'openai';
import { PlaidApi, Configuration as PlaidConfiguration, Products } from 'plaid';
import Stripe from 'stripe';
import { Client as SendGridClient } from '@sendgrid/client';
import { Mail } from '@sendgrid/helpers/classes';

export class ApiIntegrationManager {
  private openai: OpenAIApi;
  private plaid: PlaidApi;
  private stripe: Stripe;
  private sendgrid: SendGridClient;
  private static instance: ApiIntegrationManager;

  private constructor() {
    // Initialize OpenAI
    const openaiConfig = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });
    this.openai = new OpenAIApi(openaiConfig);

    // Initialize Plaid
    const plaidConfig = new PlaidConfiguration({
      basePath: process.env.PLAID_ENV === 'sandbox' ? 'https://sandbox.plaid.com' : 'https://production.plaid.com',
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });
    this.plaid = new PlaidApi(plaidConfig);

    // Initialize Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Initialize SendGrid
    this.sendgrid = new SendGridClient();
    this.sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  public static getInstance(): ApiIntegrationManager {
    if (!ApiIntegrationManager.instance) {
      ApiIntegrationManager.instance = new ApiIntegrationManager();
    }
    return ApiIntegrationManager.instance;
  }

  // OpenAI Methods
  public async generateTaxAdvice(context: string): Promise<string> {
    try {
      const completion = await this.openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a tax expert advisor." },
          { role: "user", content: context }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      return completion.data.choices[0].message?.content || '';
    } catch (error) {
      console.error('Error generating tax advice:', error);
      throw error;
    }
  }

  // Plaid Methods
  public async createPlaidLinkToken(userId: string): Promise<string> {
    try {
      const response = await this.plaid.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'AI Tax Prep',
        products: [Products.Transactions],
        country_codes: ['US'],
        language: 'en'
      });
      return response.data.link_token;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  }

  public async getPlaidTransactions(accessToken: string, startDate: string, endDate: string) {
    try {
      const response = await this.plaid.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Plaid transactions:', error);
      throw error;
    }
  }

  // Stripe Methods
  public async createSubscription(customerId: string, priceId: string) {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  public async createCustomer(email: string, name: string) {
    try {
      return await this.stripe.customers.create({
        email,
        name,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // SendGrid Methods
  public async sendTaxDocument(to: string, documentUrl: string, documentType: string) {
    const msg = new Mail({
      from: process.env.EMAIL_FROM!,
      to,
      subject: `Your ${documentType} is ready`,
      text: `You can download your ${documentType} here: ${documentUrl}`,
      html: `<p>You can download your ${documentType} <a href="${documentUrl}">here</a>.</p>`,
    });

    try {
      await this.sendgrid.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  public async sendTaxReminder(to: string, dueDate: string, taxType: string) {
    const msg = new Mail({
      from: process.env.EMAIL_FROM!,
      to,
      subject: `Reminder: ${taxType} due on ${dueDate}`,
      text: `This is a reminder that your ${taxType} is due on ${dueDate}.`,
      html: `<p>This is a reminder that your ${taxType} is due on ${dueDate}.</p>`,
    });

    try {
      await this.sendgrid.send(msg);
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  // Additional Integration Methods
  public async validateTaxId(taxId: string): Promise<boolean> {
    // Implement tax ID validation logic
    return true; // Placeholder
  }

  public async fetchW2Data(employerId: string, year: string) {
    // Implement W2 data fetching logic
    return {}; // Placeholder
  }

  public async fetch1099Data(payerId: string, year: string) {
    // Implement 1099 data fetching logic
    return {}; // Placeholder
  }
}
