import axios, { AxiosInstance } from "axios";
import { config } from "./config.js";

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: string;
  status: string;
  value: number;
  invoiceUrl: string;
  externalReference?: string;
  description?: string;
  pixCopyPaste?: string;
  pixQrCode?: string;
}

export class AsaasClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.ASAAS_BASE_URL,
      headers: {
        access_token: config.ASAAS_API_KEY,
        "Content-Type": "application/json",
      },
    });
  }

  async getOrCreateCustomer(name: string, email: string): Promise<AsaasCustomer> {
    try {
      const listResponse = await this.client.get<{ data: AsaasCustomer[] }>("/customers", {
        params: { email, limit: 1 },
      });

      if (listResponse.data.data?.length > 0) {
        return listResponse.data.data[0];
      }

      const createResponse = await this.client.post<AsaasCustomer>("/customers", {
        name,
        email,
        notificationDisabled: false,
      });

      return createResponse.data;
    } catch (error) {
      console.error("[ASAAS] Error getting/creating customer:", error);
      throw error;
    }
  }

  async getPaymentQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    try {
      const response = await this.client.get<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
      return response.data;
    } catch (error) {
      console.error("[ASAAS] Error fetching PIX QR code:", error);
      throw error;
    }
  }

  async createPayment(
    customerId: string,
    amountInCents: number,
    description = "PIX Payment",
    externalReference?: string
  ): Promise<AsaasPayment> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const response = await this.client.post<AsaasPayment>("/payments", {
        customer: customerId,
        billingType: "PIX",
        value: amountInCents / 100,
        dueDate: today,
        description,
        externalReference,
        notificationDisabled: false,
      });

      const payment = response.data;
      const pix = await this.getPaymentQrCode(payment.id);

      return {
        ...payment,
        pixCopyPaste: pix.payload,
        pixQrCode: pix.encodedImage,
      };
    } catch (error) {
      console.error("[ASAAS] Error creating payment:", error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<AsaasPayment> {
    try {
      const response = await this.client.get<AsaasPayment>(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("[ASAAS] Error getting payment status:", error);
      throw error;
    }
  }
}

export const asaasClient = new AsaasClient();
