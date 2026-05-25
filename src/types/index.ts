export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface UserInfo {
  userId: number;
  loginId: string;
  email: string;
  nickname: string;
  address: string | null;
  addressDetail: string | null;
  zipcode: string | null;
  createdAt: string;
}

export interface UserPreference {
  preferenceId: number;
  userId: number;
  preferredMusicGenres: string[];
  preferredMovieGenres: string[];
  preferredBookGenres: string[];
  preferredPlaceTypes: string[];
  ttsEnabled: boolean;
  cooldownMinutes: number;
}

export interface EmotionLog {
  emotionLogId: number;
  userId: number;
  primaryEmotion: string;
  confidenceScore: number;
  faceEmotion: string | null;
  faceConfidence: number | null;
  speechText: string | null;
  speechSentiment: string | null;
  vadStressScore: number | null;
  finalStressLevel: number;
  sighDetected: boolean;
  motionPattern: string | null;
  interventionTriggered: boolean;
  detectedAt: string;
}

export type InterventionRating = "HELPFUL" | "NEUTRAL" | "UNNECESSARY" | "ANNOYING";
export type EmotionAccuracy = string;
export type RecommendationCategory = "MUSIC" | "MOVIE" | "BOOK" | "PLACE";
export type UserFeedback = "LIKED" | "DISLIKED" | "SKIPPED";
export type RelevanceRating = string;

export interface Intervention {
  interventionId: number;
  userId: number;
  emotionLogId: number;
  interventionType: string;
  agentMessage: string;
  ttsPlayed: boolean;
  cooldownExpiresAt: string | null;
  interventionRating: InterventionRating | null;
  emotionAccuracy: EmotionAccuracy | null;
  interventionFeedbackText: string | null;
  feedbackAt: string | null;
  createdAt: string;
  recommendations: Recommendation[];
}

export interface Recommendation {
  recommendationId: number;
  interventionId: number;
  category: RecommendationCategory;
  title: string;
  artistOrAuthor: string | null;
  externalId: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  reason: string | null;
  userFeedback: UserFeedback | null;
  played: boolean;
  relevanceRating: RelevanceRating | null;
  feedbackText: string | null;
  createdAt: string;
}

export type EmotionType = "happy" | "sad" | "angry" | "fear" | "disgust" | "surprise" | "neutral";

export const EMOTION_COLORS: Record<string, string> = {
  happy: "#FFD700",
  sad: "#4A90E2",
  angry: "#E74C3C",
  fear: "#9B59B6",
  disgust: "#8B4513",
  surprise: "#FF8C00",
  neutral: "#95A5A6",
};

export const EMOTION_LABELS: Record<string, string> = {
  happy: "행복",
  sad: "슬픔",
  angry: "분노",
  fear: "공포",
  disgust: "혐오",
  surprise: "놀람",
  neutral: "중립",
};
