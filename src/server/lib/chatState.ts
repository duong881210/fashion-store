/**
 * Shared in-memory tracker for active chat sessions where the AI chatbot auto-responder
 * has been temporarily paused by a human agent.
 */
export const pausedAiSessions = new Set<string>();
