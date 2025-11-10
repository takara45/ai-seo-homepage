
import type { HearingData, TemplateSuggestion } from './types.ts';

export const HEARING_QUESTIONS: { key: keyof HearingData; question: string; type: 'text' }[] = [
  { key: 'businessDescription', question: 'はじめまして！あなたのビジネスについて教えてください。どのような事業をされていますか？（例：都内でカフェを経営しています）', type: 'text' },
  { key: 'companyName', question: '次に、あなたの会社名または店舗名を教えてください。（例：株式会社ABC）', type: 'text'},
  { key: 'atmosphere', question: 'ありがとうございます。ウェブサイトはどのような雰囲気がお好みですか？（例：高級感のある、親しみやすい、モダンでスタイリッシュ）', type: 'text' },
];

export const TEMPLATES: { [key: string]: { name: string; description: string } } = {
  Corporate: {
    name: "コーポレート",
    description: "信頼性、誠実さを重視したクリーンでプロフェッショナルなデザイン。BtoB企業や士業向け。",
  },
  Modern: {
    name: "モダン",
    description: "革新性、クリエイティビティを強調するスタイリッシュで視覚的なデザイン。スタートアップやデザイン系事務所向け。",
  },
  Friendly: {
    name: "フレンドリー",
    description: "親しみやすさ、温かみを伝えるカジュアルで明るいデザイン。店舗、個人サービス、NPO向け。",
  },
  Tech: {
    name: "テック",
    description: "最先端で革新的。ダークテーマ、ネオンカラー、幾何学的なデザインが特徴。SaaSやテクノロジー企業向け。",
  },
  Natural: {
    name: "ナチュラル",
    description: "オーガニックで落ち着いた雰囲気。アースカラー、自然なテクスチャ、クリーンなデザイン。ウェルネスやエコ関連事業向け。",
  },
  Retro: {
    name: "レトロ",
    description: "懐かしさとユニークさが魅力。特定の時代を彷彿とさせるフォントや配色が特徴。カフェやアパレル、雑貨店向け。",
  },
  Bold: {
    name: "ボールド",
    description: "エネルギッシュで印象的。鮮やかな色、大胆なタイポグラフィで注目を集めるデザイン。イベントや若者向けブランドに最適。",
  },
  Luxury: {
    name: "ラグジュアリー",
    description: "高級でエクスクルーシブな体験を提供。リッチな配色、高品質な写真、洗練されたディテールが特徴。高級ブランドや不動産向け。",
  },
};
