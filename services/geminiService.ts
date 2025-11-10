

import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { HearingData, TemplateSuggestion } from '../types.ts';
import { TEMPLATES } from '../constants.ts';

let ai: GoogleGenAI | null = null;

// AIクライアントを遅延初期化するためのシングルトン関数
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const suggestTemplate = async (hearingData: HearingData): Promise<TemplateSuggestion> => {
  const aiClient = getAiClient();
  
  const templateNames = Object.keys(TEMPLATES);
  const templateOptions = Object.entries(TEMPLATES)
    .map(([key, value], index) => `${index + 1}. "${key}": ${value.description}`)
    .join('\n');

  const prompt = `
    以下のユーザーヒアリング情報に基づいて、最も適したウェブサイトのデザインテンプレートを下記の${templateNames.length}つの中から1つ選んでください。
    選択した理由も日本語で簡潔に説明してください。

    # ユーザーヒアリング情報
    - 事業内容: ${hearingData.businessDescription || '未設定'}
    - 会社名: ${hearingData.companyName || '未設定'}
    - desired atmosphere (雰囲気): ${hearingData.atmosphere || '未設定'}

    # テンプレート選択肢
    ${templateOptions}
  `;

  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          templateName: {
            type: Type.STRING,
            enum: templateNames,
          },
          reason: {
            type: Type.STRING
          }
        },
        required: ['templateName', 'reason']
      }
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText) as TemplateSuggestion;
};

/**
 * 画像生成AIを呼び出し、Base64形式の画像データを返す
 * @param imagePrompt 画像生成のためのプロンプト
 * @returns Base64形式の画像データURL
 */
const generateImage = async (imagePrompt: string): Promise<string> => {
  const aiClient = getAiClient();
  // 画像生成に特化した、より詳細なプロンプトを作成
  const detailedImagePrompt = `
    プロフェッショナルな写真、高品質、高解像度で、以下の内容の画像を生成してください:
    「${imagePrompt}」

    **重要**: 生成する画像には、いかなる形の文字、テキスト、数字、ロゴ、記号も絶対に含めないでください。純粋なビジュアルのみにしてください。
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: detailedImagePrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // 最初の候補から画像データを取得
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (imagePart && imagePart.inlineData) {
      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType;
      return `data:${mimeType};base64,${base64Data}`;
    } else {
      throw new Error('Image data not found in response');
    }
  } catch (error) {
    console.error(`Error generating image for prompt "${imagePrompt}":`, error);
    // エラーが発生した場合は、グレーのプレースホルダーを返す
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='100%25' height='100%25' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='30' fill='%23555555' dominant-baseline='middle' text-anchor='middle'%3EImage Generation Failed%3C/text%3E%3C/svg%3E";
  }
};


export const generateHtml = async (hearingData: HearingData, templateName: string): Promise<string> => {
  const aiClient = getAiClient();
  const templateDescription = TEMPLATES[templateName]?.description || '';
  
  const structurePrompt = `
    あなたは世界クラスのフロントエンドエンジニア兼SEOスペシャリストです。
    以下の要件に従って、単一ページのレスポンシブなウェブサイトのHTML構造と、そのサイトに必要な画像のプロンプトリストをJSON形式で生成してください。

    # 要件
    1.  **フレームワーク/スタイリング:**
        *   Tailwind CSSクラスのみを使用してスタイリングしてください。
        *   JavaScriptは不要です。
        *   **モバイルファーストのレスポンシブデザイン**を徹底してください。
    2.  **SEO最適化:**
        *   効果的な<title>と<meta name="description">を生成してください。
        *   <h1>, <h2>, <h3>タグを適切に使用してください。
        *   JSON-LD形式の構造化データを<head>内に埋め込んでください。
    3.  **コンテンツ:**
        *   以下の**ユーザー提供情報**をWebサイトのコンテンツに強く反映させてください。
        *   ヒーローセクション、事業内容紹介、サービスや商品の特徴、会社概要、お問い合わせセクションを必ず含めてください。
        *   **サイトの目的、ターゲット層、具体的なサービス内容、住所、電話番号**については、ユーザー提供情報に基づいて、あなたが最も適切と思われる**架空の情報**を生成し、コンテンツに含めてください。
        *   **画像が必要な箇所には、\`[IMAGE_PLACEHOLDER_1]\`, \`[IMAGE_PLACEHOLDER_2]\` のように、連番でユニークなプレースホルダー文字列を挿入してください。実際の<img>タグはまだ含めないでください。**
        *   ロゴが必要な箇所には、会社名をテキストでスタイリッシュに表示するか、適切なアイコン（HeroiconsのようなインラインSVG）を使用してください。
    4.  **デザイン:**
        *   選択されたデザインテンプレート「${templateName}」の雰囲気（${templateDescription}）をデザインに強く反映させてください。
        *   モダンで見栄えの良い、プロフェッショナルなデザインにしてください。

    # ユーザー提供情報
    - 会社名: ${hearingData.companyName}
    - 事業内容: ${hearingData.businessDescription}
    - 希望するウェブサイトの雰囲気: ${hearingData.atmosphere}
    
    # 出力形式
    - 必ず下記のJSONスキーマに従って出力してください。
    - htmlContent: \`<!DOCTYPE html>\`から\`</html>\`まで含む完全なHTML文字列。
    - imagePrompts: HTML内のプレースホルダーに対応する、画像生成のための具体的で情景が浮かぶような日本語のプロンプトの配列。配列の順序はプレースホルダーの番号と一致させてください。 (例: ["モダンなオフィスの内観、自然光が差し込んでいる", "笑顔でミーティングする多様なチームメンバー"])
  `;

  // ステップ1: HTML構造と画像プロンプトを生成
  const structureResponse = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash', // 高速なflashモデルを使用してモバイルでのタイムアウトを防ぐ
    contents: structurePrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          htmlContent: { type: Type.STRING },
          imagePrompts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['htmlContent', 'imagePrompts']
      }
    }
  });

  const { htmlContent, imagePrompts } = JSON.parse(structureResponse.text.trim());

  if (!imagePrompts || imagePrompts.length === 0) {
    return htmlContent;
  }
  
  // ステップ2: 画像プロンプトを元に画像を並列生成
  const imageUrls = await Promise.all(
    imagePrompts.map((prompt: string) => generateImage(prompt))
  );

  // ステップ3: HTMLのプレースホルダーを生成した画像のBase64データURLに置換
  let finalHtml = htmlContent;
  imageUrls.forEach((url, index) => {
    // プレースホルダーを実際の<img>タグに置換する。alt属性もプロンプトから生成する。
    const imageTag = `<img src="${url}" alt="${imagePrompts[index]}" class="w-full h-full object-cover">`;
    finalHtml = finalHtml.replace(`[IMAGE_PLACEHOLDER_${index + 1}]`, imageTag);
  });
  
  // <img>タグを含まなかったかもしれないプレースホルダーを削除
  finalHtml = finalHtml.replace(/\[IMAGE_PLACEHOLDER_\d+\]/g, '');


  return finalHtml;
};
