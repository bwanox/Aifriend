import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-user-sentiment.ts';
import '@/ai/flows/generate-initial-prompt.ts';
import '@/ai/flows/generate-chat-response.ts';
