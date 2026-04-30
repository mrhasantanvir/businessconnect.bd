"use server";

import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSystemSettingsAction() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "GLOBAL" },
    });
    
    // If doesn't exist, create default
    if (!settings) {
      return await prisma.systemSettings.create({
        data: { id: "GLOBAL" },
      });
    }
    
    return settings;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }
}

export async function updateSystemSettingsAction(data: any) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: "GLOBAL" },
      update: data,
      create: { id: "GLOBAL", ...data },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard"); // For live chat visibility checks
    
    return { success: true, settings };
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    return { success: false, error: error.message };
  }
}

export async function getEmailTemplatesAction() {
  try {
    const templates = await prisma.emailTemplate.findMany();
    
    // Seed default templates if they don't exist
    const generateHtml = (titleEn: string, bodyEn: string, titleBn: string, bodyBn: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #f8fafc;">
        <div style="background-color: #1e40af; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold; font-style: italic;">BUSINESS<span style="color: #60a5fa;">CONNECT</span></h1>
        </div>
        <div style="padding: 32px; background-color: #ffffff;">
          <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">${titleEn}</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">${bodyEn}</p>
          
          <hr style="border-top: 1px dashed #cbd5e1; margin: 24px 0;" />
          
          <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">${titleBn}</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">${bodyBn}</p>

          <div style="margin-top: 32px; text-align: center;">
             <a href="https://businessconnect.bd" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Dashboard / ড্যাশবোর্ডে লগইন করুন</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; background-color: #f8fafc;">
          &copy; 2026 BusinessConnect.bd. All rights reserved.
        </div>
      </div>
    `;

    const defaultTypes = [
      { 
        type: "STORE_ACTIVATED", 
        name: "Store Activation Success", 
        subject: "🎉 Welcome to BusinessConnect! Your Store is Active",
        body: generateHtml(
          "Your Store has been Activated!",
          "Hello {{merchant_name}},<br><br>Congratulations! Your store <strong>{{store_name}}</strong> is now active on BusinessConnect. You can now access all features, manage products, and accept orders.",
          "আপনার স্টোরটি চালু হয়েছে!",
          "হ্যালো {{merchant_name}},<br><br>অভিনন্দন! BusinessConnect এ আপনার স্টোর <strong>{{store_name}}</strong> এখন অ্যাক্টিভ। আপনি এখন সমস্ত ফিচার ব্যবহার করতে পারবেন।"
        )
      },
      { 
        type: "STORE_REJECTED", 
        name: "Store Application Rejected", 
        subject: "Update on your BusinessConnect Application",
        body: generateHtml(
          "Store Application Update",
          "Hello {{merchant_name}},<br><br>We regret to inform you that your store application for <strong>{{store_name}}</strong> has not been approved at this time. Reason: <strong>{{message}}</strong>",
          "স্টোর আবেদনের আপডেট",
          "হ্যালো {{merchant_name}},<br><br>দুঃখের সাথে জানাচ্ছি যে আপনার স্টোর <strong>{{store_name}}</strong> এর আবেদনটি এই মুহূর্তে অনুমোদন করা হয়নি। কারণ: <strong>{{message}}</strong>"
        )
      },
      { 
        type: "DOCUMENTS_REUPLOAD", 
        name: "Request Document Reupload", 
        subject: "Action Required: Reupload your Business Documents",
        body: generateHtml(
          "Action Required: Document Reupload",
          "Hello {{merchant_name}},<br><br>We encountered an issue with your documents for <strong>{{store_name}}</strong>. Please reupload the following: <strong>{{missing_documents}}</strong>.<br><br>Message: {{message}}",
          "পদক্ষেপ প্রয়োজন: ডকুমেন্ট পুনরায় আপলোড করুন",
          "হ্যালো {{merchant_name}},<br><br>আপনার স্টোর <strong>{{store_name}}</strong> এর ডকুমেন্টে একটি সমস্যা পাওয়া গেছে। অনুগ্রহ করে নিচে উল্লিখিত ডকুমেন্টগুলো পুনরায় আপলোড করুন: <strong>{{missing_documents}}</strong>.<br><br>মেসেজ: {{message}}"
        )
      },
      { 
        type: "PAYMENT_REMINDER_5_DAYS", 
        name: "Payment Reminder (5 Days)", 
        subject: "Reminder: Payment Due in 5 Days",
        body: generateHtml(
          "Upcoming Payment Reminder",
          "Hello {{merchant_name}},<br><br>This is a friendly reminder that a payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in 5 days ({{due_date}}).",
          "পেমেন্ট রিমাইন্ডার",
          "হ্যালো {{merchant_name}},<br><br>আপনাকে মনে করিয়ে দিচ্ছি যে <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামী ৫ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_4_DAYS", 
        name: "Payment Reminder (4 Days)", 
        subject: "Reminder: Payment Due in 4 Days",
        body: generateHtml(
          "Upcoming Payment Reminder",
          "Hello {{merchant_name}},<br><br>This is a friendly reminder that a payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in 4 days ({{due_date}}).",
          "পেমেন্ট রিমাইন্ডার",
          "হ্যালো {{merchant_name}},<br><br>আপনাকে মনে করিয়ে দিচ্ছি যে <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামী ৪ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_3_DAYS", 
        name: "Payment Reminder (3 Days)", 
        subject: "Reminder: Payment Due in 3 Days",
        body: generateHtml(
          "Upcoming Payment Reminder",
          "Hello {{merchant_name}},<br><br>This is a friendly reminder that a payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in 3 days ({{due_date}}).",
          "পেমেন্ট রিমাইন্ডার",
          "হ্যালো {{merchant_name}},<br><br>আপনাকে মনে করিয়ে দিচ্ছি যে <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামী ৩ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_2_DAYS", 
        name: "Payment Reminder (2 Days)", 
        subject: "Action Required: Payment Due in 2 Days",
        body: generateHtml(
          "Urgent Payment Reminder",
          "Hello {{merchant_name}},<br><br>Your payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in just 2 days ({{due_date}}). Please process it soon to avoid service interruption.",
          "জরুরী পেমেন্ট রিমাইন্ডার",
          "হ্যালো {{merchant_name}},<br><br>আপনার <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি মাত্র ২ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে। সার্ভিস বন্ধ হওয়া এড়াতে দ্রুত পেমেন্ট করুন।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_1_DAY", 
        name: "Payment Reminder (1 Day)", 
        subject: "Urgent: Payment Due Tomorrow",
        body: generateHtml(
          "Final Payment Reminder",
          "Hello {{merchant_name}},<br><br>Your payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due TOMORROW ({{due_date}}). Your service will be paused if the payment is not received.",
          "চূড়ান্ত পেমেন্ট রিমাইন্ডার",
          "হ্যালো {{merchant_name}},<br><br>আপনার <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামীকাল ({{due_date}}) শেষ হবে। পেমেন্ট না করা হলে আপনার সার্ভিসটি বন্ধ হয়ে যাবে।"
        )
      },
      { 
        type: "PAYMENT_FAILED", 
        name: "Payment Failed", 
        subject: "Alert: Your Recent Payment Failed",
        body: generateHtml(
          "Payment Processing Failed",
          "Hello {{merchant_name}},<br><br>We were unable to process your recent payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong>. Please update your payment method or try again.",
          "পেমেন্ট ব্যর্থ হয়েছে",
          "হ্যালো {{merchant_name}},<br><br>আপনার <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি প্রক্রিয়া করা সম্ভব হয়নি। অনুগ্রহ করে আপনার পেমেন্ট পদ্ধতি আপডেট করুন বা আবার চেষ্টা করুন।"
        )
      },
      { 
        type: "PAYMENT_SUCCESSFUL", 
        name: "Payment Successful", 
        subject: "Receipt: Payment Received",
        body: generateHtml(
          "Payment Received Successfully",
          "Hello {{merchant_name}},<br><br>Thank you! We have successfully received your payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong>.",
          "পেমেন্ট সফল হয়েছে",
          "হ্যালো {{merchant_name}},<br><br>ধন্যবাদ! আমরা <strong>{{store_name}}</strong> এর জন্য আপনার <strong>৳{{due_amount}}</strong> পেমেন্টটি সফলভাবে গ্রহণ করেছি।"
        )
      },
      { 
        type: "SERVICE_PAUSED", 
        name: "Service Paused", 
        subject: "Notice: Service Paused Due to Non-Payment",
        body: generateHtml(
          "Account Service Paused",
          "Hello {{merchant_name}},<br><br>Your service for <strong>{{store_name}}</strong> has been temporarily paused because your payment of <strong>৳{{due_amount}}</strong> is overdue. Please make a payment to reactivate your store.",
          "সার্ভিস সাময়িকভাবে বন্ধ",
          "হ্যালো {{merchant_name}},<br><br>আপনার <strong>৳{{due_amount}}</strong> পেমেন্ট বকেয়া থাকার কারণে <strong>{{store_name}}</strong> এর সার্ভিস সাময়িকভাবে বন্ধ করা হয়েছে। স্টোরটি পুনরায় চালু করতে অনুগ্রহ করে পেমেন্ট করুন।"
        )
      },
      { 
        type: "SUBSCRIPTION_UPDATE", 
        name: "Subscription Updated", 
        subject: "Confirmation: Your Subscription Plan has been Updated",
        body: generateHtml(
          "Subscription Plan Updated",
          "Hello {{merchant_name}},<br><br>Your subscription plan for <strong>{{store_name}}</strong> has been successfully updated to the <strong>{{plan_name}}</strong> plan.",
          "সাবস্ক্রিপশন আপডেট সফল হয়েছে",
          "হ্যালো {{merchant_name}},<br><br>আপনার <strong>{{store_name}}</strong> এর সাবস্ক্রিপশন প্ল্যানটি সফলভাবে <strong>{{plan_name}}</strong> প্ল্যানে আপডেট করা হয়েছে।"
        )
      },
      { 
        type: "BULK_NOTIFICATION", 
        name: "Bulk Notification / Announcement", 
        subject: "Important Update from BusinessConnect",
        body: generateHtml(
          "Important Announcement",
          "Hello {{merchant_name}},<br><br>{{message}}",
          "গুরুত্বপূর্ণ ঘোষণা",
          "হ্যালো {{merchant_name}},<br><br>{{message}}"
        )
      }
    ];

    const existingTemplates = await prisma.emailTemplate.findMany();
    const existingTypes = new Set(existingTemplates.map(t => t.type));

    const missingTemplates = defaultTypes.filter(t => !existingTypes.has(t.type));

    if (missingTemplates.length > 0) {
      await prisma.emailTemplate.createMany({
        data: missingTemplates
      });
      return await prisma.emailTemplate.findMany();
    }
    
    return existingTemplates;
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return [];
  }
}

export async function updateEmailTemplateAction(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const template = await prisma.emailTemplate.update({
      where: { id },
      data
    });

    return { success: true, template };
  } catch (error: any) {
    console.error("Error updating template:", error);
    return { success: false, error: error.message };
  }
}
