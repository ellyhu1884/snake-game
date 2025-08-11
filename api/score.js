export default async function handler(req, res) {
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        if (req.method === 'POST') {
            // 提交分数
            const { player_name, score, game_duration } = req.body;
            
            // 基本验证
            if (!player_name || typeof score !== 'number' || score < 0) {
                return res.status(400).json({ error: '数据格式错误' });
            }
            
            const response = await fetch(`${SUPABASE_URL}/rest/v1/snake_scores`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    player_name: player_name.substring(0, 20), // 限制名字长度
                    score: score,
                    game_duration: game_duration || 0
                })
            });
            
            if (!response.ok) {
                throw new Error(`Supabase error: ${response.status}`);
            }
            
            return res.status(200).json({ 
                success: true, 
                message: '分数保存成功' 
            });
            
        } else if (req.method === 'GET') {
            // 获取排行榜
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
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: '服务器内部错误',
            details: error.message 
        });
    }
}
