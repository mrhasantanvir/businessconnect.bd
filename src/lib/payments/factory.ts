import { IPaymentProvider } from "./types";
import { SSLCommerzProvider } from "./sslcommerz";
import { BkashProvider } from "./bkash";
import { AamarPayProvider } from "./aamarpay";
import { NagadProvider } from "./nagad";
import { RocketProvider } from "./rocket";

class PaymentFactory {
  private providers: IPaymentProvider[] = [
    new SSLCommerzProvider(),
    new BkashProvider(),
    new AamarPayProvider(),
    new NagadProvider(),
    new RocketProvider(),
  ];

  getProvider(name: string): IPaymentProvider | null {
    return this.providers.find(p => p.name.toUpperCase() === name.toUpperCase()) || null;
  }

  getSupportedProviders(): string[] {
    return this.providers.map(p => p.name);
  }
}

export const paymentFactory = new PaymentFactory();
