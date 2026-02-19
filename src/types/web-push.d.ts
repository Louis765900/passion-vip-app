declare module 'web-push' {
  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  interface WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }

  function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: {
      gcmAPIKey?: string;
      vapidDetails?: {
        subject: string;
        publicKey: string;
        privateKey: string;
      };
      timeout?: number;
      TTL?: number;
      headers?: Record<string, string>;
      contentEncoding?: string;
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      topic?: string;
    }
  ): Promise<SendResult>;

  function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  const webpush: {
    setVapidDetails: typeof setVapidDetails;
    sendNotification: typeof sendNotification;
    generateVAPIDKeys: typeof generateVAPIDKeys;
  };

  export default webpush;
  export { setVapidDetails, sendNotification, generateVAPIDKeys, PushSubscription, SendResult, WebPushError };
}
