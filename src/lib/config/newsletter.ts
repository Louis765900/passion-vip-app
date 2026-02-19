import mailchimp from '@mailchimp/mailchimp_marketing';

const API_KEY = process.env.MAILCHIMP_API_KEY;
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
export const LIST_ID = process.env.MAILCHIMP_LIST_ID;

export const mailchimpClient = API_KEY && SERVER_PREFIX
  ? mailchimp.setConfig({
      apiKey: API_KEY,
      server: SERVER_PREFIX,
    })
  : null;

export async function subscribeToNewsletter(
  email: string,
  mergeFields?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!mailchimpClient || !LIST_ID) {
    return {
      success: false,
      error: 'Newsletter not configured',
    };
  }

  try {
    await mailchimp.lists.addListMember(LIST_ID, {
      email_address: email,
      status: 'subscribed',
      merge_fields: mergeFields,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Newsletter] Subscribe error:', error);
    
    // Handle already subscribed
    if (error.status === 400 && error.detail?.includes('already a list member')) {
      return { success: true };
    }

    return {
      success: false,
      error: error.message || 'Failed to subscribe',
    };
  }
}

export async function unsubscribeFromNewsletter(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!mailchimpClient || !LIST_ID) {
    return {
      success: false,
      error: 'Newsletter not configured',
    };
  }

  try {
    const subscriberHash = Buffer.from(email.toLowerCase()).toString('base64');
    
    await mailchimp.lists.updateListMember(LIST_ID, subscriberHash, {
      status: 'unsubscribed',
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Newsletter] Unsubscribe error:', error);
    return {
      success: false,
      error: error.message || 'Failed to unsubscribe',
    };
  }
}
