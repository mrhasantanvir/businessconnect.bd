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

import nodemailer from "nodemailer";

export async function testSmtpConnectionAction(testEmail: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings?.smtpHost || !settings?.smtpUser || !settings?.smtpPass) {
      return { success: false, error: "SMTP settings are incomplete." };
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpPort === 465,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"${settings.siteTitle}" <${settings.smtpFrom || settings.smtpUser}>`,
      to: testEmail,
      subject: "SMTP Test - BusinessConnect",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
           <h2 style="color: #1e40af; margin-top: 0;">SMTP Test Successful 🎉</h2>
           <p style="color: #334155;">Your email configuration on <strong>BusinessConnect</strong> is working perfectly!</p>
           <p style="color: #64748b; font-size: 12px; margin-top: 20px;">This is an automated test message.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return { success: false, error: error.message || "Failed to connect to SMTP server." };
  }
}

export async function getEmailTemplatesAction() {
  try {
    const templates = await prisma.emailTemplate.findMany();
    
    // Seed default templates if they don't exist
    const generateHtml = (titleEn: string, bodyEn: string, titleBn: string, bodyBn: string) => `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef2f6;">
        <!-- Premium Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">BUSINESS<span style="color: #93c5fd;">CONNECT</span></h1>
          <p style="color: #bfdbfe; font-size: 14px; margin-top: 8px; font-weight: 500;">Empowering Your Digital Business</p>
        </div>

        <!-- Content Body -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <!-- English Section -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #0f172a; font-size: 22px; margin-top: 0; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">${titleEn}</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.7; margin-top: 20px;">${bodyEn}</p>
          </div>

          <!-- Divider -->
          <div style="height: 1px; background: linear-gradient(to right, transparent, #cbd5e1, transparent); margin: 35px 0;"></div>

          <!-- Bangla Section -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #0f172a; font-size: 22px; margin-top: 0; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">${titleBn}</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.7; margin-top: 20px;">${bodyBn}</p>
          </div>

          <!-- Call to Action -->
          <div style="margin-top: 45px; text-align: center;">
             <a href="https://businessconnect.bd" style="background: #2563eb; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(37,99,235,0.3); transition: all 0.3s;">Access Dashboard / ড্যাশবোর্ডে প্রবেশ করুন</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 24px; text-align: center; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
          <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 500;">Need help? Contact our support team at <a href="mailto:support@businessconnect.bd" style="color: #3b82f6; text-decoration: none;">support@businessconnect.bd</a></p>
          <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">&copy; 2026 BusinessConnect.bd. All rights reserved.</p>
        </div>
      </div>
    `;

    const defaultTypes = [
      { 
        type: "STORE_ACTIVATED", 
        name: "Store Activation Success", 
        subject: "🎉 Welcome to BusinessConnect! Your Store is Active",
        body: generateHtml(
          "Your Store is Now Active!",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Congratulations! We have successfully verified your details and your store <strong>{{store_name}}</strong> is now <strong>Active</strong> on BusinessConnect.<br><br>You can now access your dashboard to manage products, view analytics, and accept orders.",
          "আপনার স্টোরটি এখন অ্যাক্টিভ!",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>অভিনন্দন! আমরা সফলভাবে আপনার তথ্য ভেরিফাই করেছি এবং আপনার স্টোর <strong>{{store_name}}</strong> এখন BusinessConnect-এ <strong>অ্যাক্টিভ</strong> হয়েছে।<br><br>আপনি এখন আপনার ড্যাশবোর্ড থেকে প্রোডাক্ট ম্যানেজ, অ্যানালিটিক্স দেখা এবং অর্ডার গ্রহণ করতে পারবেন।"
        )
      },
      { 
        type: "STORE_REJECTED", 
        name: "Store Application Rejected", 
        subject: "Update on your BusinessConnect Application",
        body: generateHtml(
          "Store Application Update",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Thank you for your interest in joining BusinessConnect with <strong>{{store_name}}</strong>.<br><br>After careful review of your application, we regret to inform you that we cannot approve your store at this time.<br><br><strong>Reason for Rejection:</strong><br><span style='display:inline-block; background-color:#f1f5f9; color:#334155; padding:12px 16px; border-left:4px solid #ef4444; border-radius:4px; font-weight:500; margin:10px 0; width: 100%; box-sizing: border-box;'>{{message}}</span><br><br>If you believe this was a mistake, please reach out to our support team.",
          "স্টোর আবেদনের আপডেট",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>BusinessConnect-এ <strong>{{store_name}}</strong> এর সাথে যুক্ত হওয়ার আগ্রহ প্রকাশের জন্য ধন্যবাদ।<br><br>আপনার আবেদনটি সতর্কতার সাথে পর্যালোচনা করার পর, দুঃখের সাথে জানাচ্ছি যে আমরা এই মুহূর্তে আপনার স্টোরটি অনুমোদন করতে পারছি না।<br><br><strong>বাতিল হওয়ার কারণ:</strong><br><span style='display:inline-block; background-color:#f1f5f9; color:#334155; padding:12px 16px; border-left:4px solid #ef4444; border-radius:4px; font-weight:500; margin:10px 0; width: 100%; box-sizing: border-box;'>{{message}}</span><br><br>যদি আপনি মনে করেন এটি ভুলবশত হয়েছে, তবে অনুগ্রহ করে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।"
        )
      },
      { 
        type: "DOCUMENTS_REUPLOAD", 
        name: "Request Document Reupload", 
        subject: "Action Required: Reupload your Business Documents",
        body: generateHtml(
          "Action Required: Document Reupload",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Thank you for choosing BusinessConnect for <strong>{{store_name}}</strong>. During our verification process, we found an issue with your provided documents.<br><br>To proceed with your activation, please reupload the following documents:<br><span style='display:inline-block; background-color:#fee2e2; color:#b91c1c; padding:8px 16px; border-radius:6px; font-weight:bold; margin:10px 0;'>{{missing_documents}}</span><br><br><strong>Additional Notes from Admin:</strong><br><span style='display:inline-block; background-color:#fef9c3; color:#854d0e; padding:12px 16px; border-left:4px solid #eab308; border-radius:4px; font-weight:500; margin:10px 0; width: 100%; box-sizing: border-box;'>{{message}}</span>",
          "পদক্ষেপ প্রয়োজন: ডকুমেন্ট পুনরায় আপলোড করুন",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>BusinessConnect-এ <strong>{{store_name}}</strong> এর জন্য আবেদন করার জন্য ধন্যবাদ। আমাদের ভেরিফিকেশন প্রক্রিয়ায় আপনার ডকুমেন্টে একটি সমস্যা পাওয়া গেছে।<br><br>আপনার স্টোরটি চালু করার জন্য, অনুগ্রহ করে নিচের ডকুমেন্টগুলো পুনরায় আপলোড করুন:<br><span style='display:inline-block; background-color:#fee2e2; color:#b91c1c; padding:8px 16px; border-radius:6px; font-weight:bold; margin:10px 0;'>{{missing_documents}}</span><br><br><strong>অ্যাডমিন মেসেজ:</strong><br><span style='display:inline-block; background-color:#fef9c3; color:#854d0e; padding:12px 16px; border-left:4px solid #eab308; border-radius:4px; font-weight:500; margin:10px 0; width: 100%; box-sizing: border-box;'>{{message}}</span>"
        )
      },
      { 
        type: "PAYMENT_REMINDER_5_DAYS", 
        name: "Payment Reminder (5 Days)", 
        subject: "Reminder: Payment Due in 5 Days",
        body: generateHtml(
          "Upcoming Payment Reminder",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>This is a friendly reminder that a payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in 5 days ({{due_date}}).",
          "পেমেন্ট রিমাইন্ডার",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনাকে মনে করিয়ে দিচ্ছি যে <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামী ৫ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_4_DAYS", 
        name: "Payment Reminder (4 Days)", 
        subject: "Reminder: Payment Due in 4 Days",
        body: generateHtml(
          "Upcoming Payment Reminder",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>This is a friendly reminder that a payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in 4 days ({{due_date}}).",
          "পেমেন্ট রিমাইন্ডার",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনাকে মনে করিয়ে দিচ্ছি যে <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামী ৪ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_3_DAYS", 
        name: "Payment Reminder (3 Days)", 
        subject: "Reminder: Payment Due in 3 Days",
        body: generateHtml(
          "Upcoming Payment Reminder",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>This is a friendly reminder that a payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in 3 days ({{due_date}}).",
          "পেমেন্ট রিমাইন্ডার",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনাকে মনে করিয়ে দিচ্ছি যে <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামী ৩ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_2_DAYS", 
        name: "Payment Reminder (2 Days)", 
        subject: "Action Required: Payment Due in 2 Days",
        body: generateHtml(
          "Urgent Payment Reminder",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Your payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due in just 2 days ({{due_date}}). Please process it soon to avoid service interruption.",
          "জরুরী পেমেন্ট রিমাইন্ডার",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনার <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি মাত্র ২ দিনের ({{due_date}}) মধ্যে পরিশোধ করতে হবে। সার্ভিস বন্ধ হওয়া এড়াতে দ্রুত পেমেন্ট করুন।"
        )
      },
      { 
        type: "PAYMENT_REMINDER_1_DAY", 
        name: "Payment Reminder (1 Day)", 
        subject: "Urgent: Payment Due Tomorrow",
        body: generateHtml(
          "Final Payment Reminder",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Your payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong> is due TOMORROW ({{due_date}}). Your service will be paused if the payment is not received.",
          "চূড়ান্ত পেমেন্ট রিমাইন্ডার",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনার <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি আগামীকাল ({{due_date}}) শেষ হবে। পেমেন্ট না করা হলে আপনার সার্ভিসটি বন্ধ হয়ে যাবে।"
        )
      },
      { 
        type: "PAYMENT_FAILED", 
        name: "Payment Failed", 
        subject: "Alert: Your Recent Payment Failed",
        body: generateHtml(
          "Payment Processing Failed",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>We were unable to process your recent payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong>. Please update your payment method or try again.",
          "পেমেন্ট ব্যর্থ হয়েছে",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনার <strong>{{store_name}}</strong> এর <strong>৳{{due_amount}}</strong> পেমেন্টটি প্রক্রিয়া করা সম্ভব হয়নি। অনুগ্রহ করে আপনার পেমেন্ট পদ্ধতি আপডেট করুন বা আবার চেষ্টা করুন।"
        )
      },
      { 
        type: "PAYMENT_SUCCESSFUL", 
        name: "Payment Successful", 
        subject: "Receipt: Payment Received",
        body: generateHtml(
          "Payment Received Successfully",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Thank you! We have successfully received your payment of <strong>৳{{due_amount}}</strong> for <strong>{{store_name}}</strong>.",
          "পেমেন্ট সফল হয়েছে",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>ধন্যবাদ! আমরা <strong>{{store_name}}</strong> এর জন্য আপনার <strong>৳{{due_amount}}</strong> পেমেন্টটি সফলভাবে গ্রহণ করেছি।"
        )
      },
      { 
        type: "SERVICE_PAUSED", 
        name: "Service Paused", 
        subject: "Notice: Service Paused Due to Non-Payment",
        body: generateHtml(
          "Account Service Paused",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Your service for <strong>{{store_name}}</strong> has been temporarily paused because your payment of <strong>৳{{due_amount}}</strong> is overdue. Please make a payment to reactivate your store.",
          "সার্ভিস সাময়িকভাবে বন্ধ",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনার <strong>৳{{due_amount}}</strong> পেমেন্ট বকেয়া থাকার কারণে <strong>{{store_name}}</strong> এর সার্ভিস সাময়িকভাবে বন্ধ করা হয়েছে। স্টোরটি পুনরায় চালু করতে অনুগ্রহ করে পেমেন্ট করুন।"
        )
      },
      { 
        type: "SUBSCRIPTION_UPDATE", 
        name: "Subscription Updated", 
        subject: "Confirmation: Your Subscription Plan has been Updated",
        body: generateHtml(
          "Subscription Plan Updated",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>Your subscription plan for <strong>{{store_name}}</strong> has been successfully updated to the <strong>{{plan_name}}</strong> plan.",
          "সাবস্ক্রিপশন আপডেট সফল হয়েছে",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>আপনার <strong>{{store_name}}</strong> এর সাবস্ক্রিপশন প্ল্যানটি সফলভাবে <strong>{{plan_name}}</strong> প্ল্যানে আপডেট করা হয়েছে।"
        )
      },
      { 
        type: "BULK_NOTIFICATION", 
        name: "Bulk Notification / Announcement", 
        subject: "Important Update from BusinessConnect",
        body: generateHtml(
          "Important Announcement",
          "Hello <strong>{{merchant_name}}</strong>,<br><br>{{message}}",
          "গুরুত্বপূর্ণ ঘোষণা",
          "হ্যালো <strong>{{merchant_name}}</strong>,<br><br>{{message}}"
        )
      }
    ];

    // Force update all templates to the new premium UI
    for (const t of defaultTypes) {
      await prisma.emailTemplate.upsert({
        where: { type: t.type },
        update: {
          name: t.name,
          subject: t.subject,
          body: t.body
        },
        create: {
          type: t.type,
          name: t.name,
          subject: t.subject,
          body: t.body
        }
      });
    }

    return await prisma.emailTemplate.findMany();
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return [];
  }
}

import { extractNIDInfo } from "@/lib/vision";

export async function testOpenAIConnectionAction(imageUrl?: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized");

    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    if (!settings?.openaiApiKey) {
      return { success: false, error: "OpenAI API Key is not configured." };
    }

    // If no image provided, just do a simple chat completion test
    if (!imageUrl) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.openaiApiKey.trim()}`
        },
        body: JSON.stringify({
          model: settings.openaiModel || "gpt-4o",
          messages: [{ role: "user", content: "Hello, are you working?" }],
          max_tokens: 10
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("OpenAI Direct API Error:", data);
        return { 
          success: false, 
          error: data.error?.message || `API Error: ${response.status} ${response.statusText}` 
        };
      }

      return { success: true, message: data.choices[0].message.content };
    }

    // If image provided, test NID extraction
    const result = await extractNIDInfo(imageUrl);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("OpenAI Test Error:", error);
    return { success: false, error: error.message || "Failed to connect to OpenAI." };
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
