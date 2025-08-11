export default async function handler(req, res) {
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ error: '服务器配置错误' });
    }
    
    try {
        if (req.method === 'GET') {
            // 获取排行榜 - 按分数降序，创建时间升序（同分数情况下先达到的排前面）
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/snake_scores?select=player_name,score,created_at&order=score.desc,created_at.asc&limit=10`,
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`Supabase error: ${response.status}`);
            }
            
            const data = await response.json();
            return res.status(200).json(data);
            
        } else {
            return res.status(405).json({ error: '不支持的请求方法' });
        }
        
    } catch (error) {
        console.error('Leaderboard API Error:', error);
        return res.status(500).json({ 
            error: '服务器内部错误',
            details: error.message 
        });
    }
}
