import { Router, Request, Response } from "express";
import { asaasClient } from "./asaas-client.js";

const router = Router();

router.get("/health", (_req: Request, res: Response): void => {
  res.json({ ok: true });
});

router.post("/payment/checkout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, amount } = req.body;

    if (!name || !email || amount === undefined || amount === null) {
      res.status(400).json({ error: "Missing required fields: name, email, amount" });
      return;
    }

    const amountInCents = Number(amount);

    if (!Number.isFinite(amountInCents) || amountInCents < 50) {
      res.status(400).json({ error: "Minimum amount is 50 cents" });
      return;
    }

    const customer = await asaasClient.getOrCreateCustomer(name, email);
    const payment = await asaasClient.createPayment(customer.id, amountInCents, "PIX Payment");

    res.json({
      paymentId: payment.id,
      value: payment.value,
      status: payment.status,
      invoiceUrl: payment.invoiceUrl,
      pixCopyPaste: payment.pixCopyPaste,
      pixQrCode: payment.pixQrCode,
      pixCode: payment.pixCopyPaste,
      qrCodeImage: payment.pixQrCode,
    });
  } catch (error: any) {
    console.error("[Checkout Error]", error?.response?.data || error?.message || error);
    res.status(500).json({
      error: "Failed to create checkout",
      details: error?.response?.data || error?.message || "Internal server error",
    });
  }
});

router.get("/payment/status/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Payment ID is required" });
      return;
    }

    const payment = await asaasClient.getPaymentStatus(id);

    res.json({
      paymentId: payment.id,
      status: payment.status,
      value: payment.value,
      invoiceUrl: payment.invoiceUrl,
    });
  } catch (error: any) {
    console.error("[Payment Status Error]", error?.response?.data || error?.message || error);
    res.status(500).json({
      error: "Failed to get payment status",
      details: error?.response?.data || error?.message || "Internal server error",
    });
  }
});

export default router;
