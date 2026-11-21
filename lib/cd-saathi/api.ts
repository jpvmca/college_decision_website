export type CollegeCard = {
  collegeId: number;
  programmeId: number | null;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  feesMin: number | null;
  feesMax: number | null;
  examNames: string[];
  placementAvg: number | null;
  score: number;
  reason: string;
  instituteType?: string | null;
  logo?: string | null;
  courseNames?: string[];
  /** When false, open CollegeViewDetailsModal instead of /colleges/{slug}. */
  isPublished?: boolean;
};

export type QuickReply = { id: string; label: string };

export type ChatSessionResponse = {
  chatSessionId: number;
  greeting: string;
  quickReplies: QuickReply[];
};

export async function startChatSession(input: {
  visitorId: string;
  sessionId: string;
  pageUrl: string;
}): Promise<ChatSessionResponse> {
  const res = await fetch('/api/chat/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not start chat');
  return json.data as ChatSessionResponse;
}

export type LeadPromptPayload = {
  show: boolean;
  course?: string | null;
  city?: string | null;
  nameHint?: string | null;
};

export type LeadPrefillPayload = {
  field: 'course' | 'city' | 'name';
  value: string;
};

export type StreamHandlers = {
  onToken: (text: string) => void;
  onCards: (cards: CollegeCard[]) => void;
  onQuickReplies: (items: QuickReply[]) => void;
  onLeadPrompt: (payload: LeadPromptPayload) => void;
  onLeadPrefill?: (payload: LeadPrefillPayload) => void;
  onDone: (messageId: number, intent: string) => void;
  onError?: (message: string) => void;
};

/** Consume SSE from /api/chat/message. */
export async function streamChatMessage(
  body: { chatSessionId: number; text?: string; quickReplyId?: string },
  handlers: StreamHandlers,
  signal?: AbortSignal
) {
  const res = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal
  });
  if (!res.ok || !res.body) {
    handlers.onError?.('Chat is temporarily unavailable.');
    handlers.onDone(0, 'error');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = 'message';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n');
    buffer = parts.pop() || '';
    for (const line of parts) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (!raw) continue;
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(raw);
      } catch {
        continue;
      }
      if (eventName === 'token' && typeof data.text === 'string') handlers.onToken(data.text);
      else if (eventName === 'cards' && Array.isArray(data.cards)) handlers.onCards(data.cards as CollegeCard[]);
      else if (eventName === 'quick_replies' && Array.isArray(data.items)) handlers.onQuickReplies(data.items as QuickReply[]);
      else if (eventName === 'lead_prompt') {
        handlers.onLeadPrompt({
          show: Boolean(data.show),
          course: typeof data.course === 'string' ? data.course : null,
          city: typeof data.city === 'string' ? data.city : null,
          nameHint: typeof data.nameHint === 'string' ? data.nameHint : null
        });
      } else if (eventName === 'lead_prefill' && typeof data.field === 'string' && typeof data.value === 'string') {
        handlers.onLeadPrefill?.({ field: data.field as LeadPrefillPayload['field'], value: data.value });
      } else if (eventName === 'done') handlers.onDone(Number(data.messageId) || 0, String(data.intent || ''));
    }
  }
}

export async function sendChatFeedback(messageId: number, thumbs: 1 | -1 | 0, comment?: string) {
  await fetch('/api/chat/feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messageId, thumbs, comment }),
    cache: 'no-store'
  }).catch(() => undefined);
}

export async function markCardClick(
  chatSessionId: number,
  collegeId: number,
  action?: 'view' | 'compare' | 'counselling'
) {
  await fetch('/api/chat/card-click', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chatSessionId, collegeId, action }),
    cache: 'no-store'
  }).catch(() => undefined);
}

export async function fetchConsentText() {
  try {
    const res = await fetch('/api/chat/consent', { cache: 'no-store' });
    const json = await res.json();
    return {
      text: String(json?.data?.text || 'I agree that College Decision may contact me about college shortlists.'),
      version: String(json?.data?.version || 'v1')
    };
  } catch {
    return {
      text: 'I agree that College Decision may contact me about college shortlists.',
      version: 'v1'
    };
  }
}

export async function sendLeadOtp(phone: string): Promise<{
  destinationMasked?: string;
  expiresInSeconds?: number;
  resendAfterSeconds?: number;
}> {
  const res = await fetch('/api/chat/lead/otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone }),
    cache: 'no-store'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not send OTP');
  return (json.data || {}) as {
    destinationMasked?: string;
    expiresInSeconds?: number;
    resendAfterSeconds?: number;
  };
}

export async function verifyLeadOtp(phone: string, code: string) {
  const res = await fetch('/api/chat/lead/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ phone, code }),
    cache: 'no-store'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Invalid code');
  return json.data as { verificationToken: string };
}

export async function submitChatLead(input: {
  chatSessionId: number;
  visitorId: string;
  name: string;
  phone: string;
  email?: string;
  course?: string;
  consent: true;
  consentTextVersion: string;
  verificationToken: string;
}) {
  const res = await fetch('/api/chat/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Could not save details');
  return json.data;
}
