const FB_GRAPH_URL = "https://graph.facebook.com/v19.0";

/**
 * Facebook Marketing & Messaging Discovery Hub
 * Automated asset fetching for Unified Meta Hub setup.
 */

export interface MetaAdAccount {
  id: string;
  name: string;
}

export interface MetaPixel {
  id: string;
  name: string;
}

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

/**
 * Fetch all available Ad Accounts for the authenticated user
 */
export async function getFacebookAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  try {
    const response = await fetch(`${FB_GRAPH_URL}/me/adaccounts?fields=name,account_id&access_token=${accessToken}`);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("[Meta Discovery Error]: Failed to fetch Ad Accounts", err);
    return [];
  }
}

/**
 * Fetch Pixels associated with a specific Ad Account
 */
export async function getFacebookPixels(adAccountId: string, accessToken: string): Promise<MetaPixel[]> {
  try {
    const response = await fetch(`${FB_GRAPH_URL}/${adAccountId}/adspixels?fields=name,id&access_token=${accessToken}`);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error(`[Meta Discovery Error]: Failed to fetch Pixels for ${adAccountId}`, err);
    return [];
  }
}

/**
 * Fetch Facebook Pages (for Messenger/Instagram chatbot integration)
 */
export async function getFacebookPages(accessToken: string): Promise<MetaPage[]> {
  try {
    const response = await fetch(`${FB_GRAPH_URL}/me/accounts?fields=name,access_token,category,id&access_token=${accessToken}`);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("[Meta Discovery Error]: Failed to fetch Pages", err);
    return [];
  }
}

/**
 * Subscribe a Page to the Platform's Webhook
 * Required for Chatbot automation to receive messages.
 */
export async function subscribePageToWebhook(pageId: string, pageAccessToken: string) {
  try {
    const response = await fetch(`${FB_GRAPH_URL}/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_optins&access_token=${pageAccessToken}`, {
      method: "POST"
    });
    return await response.json();
  } catch (err) {
    console.error(`[Meta Webhook Error]: Failed to subscribe page ${pageId}`, err);
    return { success: false };
  }
}
