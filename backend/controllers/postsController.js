import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate SNS posts (X/Twitter) from selected topic using Gemini AI
 */
export async function generatePosts(req, res) {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }

        const { topic } = req.body;

        if (!topic || !topic.title || !topic.summary) {
            return res.status(400).json({
                error: 'Invalid topic data'
            });
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // System + User Prompt (as specified in requirements)
        const prompt = `あなたはFX情報をXで発信する投資系アカウントの編集者です。
中立的で落ち着いたトーンで、情報共有を目的とした文章を作成してください。
投資助言・売買推奨は行わないでください。

以下のFXトピックを題材に、X（旧Twitter）投稿用の文章を5案作成してください。

【条件】
・全角140〜180文字
・初心者にも理解できる内容
・煽り・断定表現は禁止
・文末は柔らかい表現
・関連ハッシュタグを2〜4個含める
・JSON形式で出力：[{"post": "投稿文..."}]

【トピック】
タイトル：${topic.title}
要約：${topic.summary}

JSON形式のみで5案回答してください。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Extract JSON from response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const postsData = JSON.parse(text);
        const posts = postsData.map(item => item.post);

        res.json({
            success: true,
            posts: posts.slice(0, 5), // Ensure exactly 5 posts
            topic: topic,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Gemini API Error (Posts):', error.message);
        res.status(500).json({
            error: 'Failed to generate posts',
            message: error.message
        });
    }
}
