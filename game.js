// 游戏配置
const CONFIG = {
    CANVAS_SIZE: 400,
    GRID_SIZE: 20,
    INITIAL_SPEED: 150
};

// 游戏状态
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        
        // 游戏状态
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: CONFIG.GRID_SIZE, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        // 加载本地最高分
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.highScoreElement.textContent = this.highScore;
        
        this.initializeEvents();
        this.loadLeaderboard();
    }
    
    initializeEvents() {
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveScore());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.playAgain());
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 阻止方向键滚动页面
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop = setInterval(() => this.update(), CONFIG.INITIAL_SPEED);
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
        }
    }
    
    pauseGame() {
        if (this.gameRunning) {
            this.gameRunning = false;
            clearInterval(this.gameLoop);
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
        }
    }
    
    resetGame() {
        this.pauseGame();
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: CONFIG.GRID_SIZE, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.draw();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        const key = e.code;
        
        // 防止反向移动
        switch (key) {
            case 'ArrowUp':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: -CONFIG.GRID_SIZE };
                }
                break;
            case 'ArrowDown':
                if (this.direction.y === 0) {
                    this.direction = { x: 0, y: CONFIG.GRID_SIZE };
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x === 0) {
                    this.direction = { x: -CONFIG.GRID_SIZE, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (this.direction.x === 0) {
                    this.direction = { x: CONFIG.GRID_SIZE, y: 0 };
                }
                break;
        }
    }
    
    update() {
        // 移动蛇头
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            
            // 更新最高分
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = this.highScore;
                localStorage.setItem('snakeHighScore', this.highScore);
            }
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    checkCollision(head) {
        // 撞墙
        if (head.x < 0 || head.x >= CONFIG.CANVAS_SIZE || 
            head.y < 0 || head.y >= CONFIG.CANVAS_SIZE) {
            return true;
        }
        
        // 撞到自己
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * (CONFIG.CANVAS_SIZE / CONFIG.GRID_SIZE)) * CONFIG.GRID_SIZE,
                y: Math.floor(Math.random() * (CONFIG.CANVAS_SIZE / CONFIG.GRID_SIZE)) * CONFIG.GRID_SIZE
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
        
        // 绘制蛇
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            // 蛇头用不同颜色
            if (i === 0) {
                this.ctx.fillStyle = '#8BC34A';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(segment.x, segment.y, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);
        }
        
        // 绘制食物
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(this.food.x, this.food.y, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);
    }
    
    gameOver() {
        this.pauseGame();
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').style.display = 'block';
    }
    
    saveScore() {
        const playerName = document.getElementById('playerName').value.trim();
        if (!playerName) {
            alert('请输入你的名字！');
            return;
        }
        
        // 这里调用API保存分数
        this.submitScore(playerName, this.score);
    }
    
    async submitScore(playerName, score) {
        try {
            // 注意：这个URL需要替换成你的Vercel项目地址
            const response = await fetch('YOUR_VERCEL_URL/api/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    player_name: playerName,
                    score: score,
                    game_duration: 0 // 可以添加游戏时长记录
                })
            });
            
            if (response.ok) {
                alert('分数保存成功！');
                document.getElementById('gameOverModal').style.display = 'none';
                this.loadLeaderboard(); // 重新加载排行榜
            } else {
                alert('分数保存失败，请稍后重试');
            }
        } catch (error) {
            console.error('保存分数出错:', error);
            alert('网络错误，分数保存失败');
        }
    }
    
    async loadLeaderboard() {
        try {
            // 注意：这个URL需要替换成你的Vercel项目地址
            const response = await fetch('YOUR_VERCEL_URL/api/leaderboard');
            const scores = await response.json();
            
            this.displayLeaderboard(scores);
        } catch (error) {
            console.error('加载排行榜出错:', error);
            document.getElementById('leaderboardList').innerHTML = '加载失败';
        }
    }
    
    displayLeaderboard(scores) {
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (!scores || scores.length === 0) {
            leaderboardList.innerHTML = '暂无记录';
            return;
        }
        
        const html = scores.map((score, index) => `
            <div class="leaderboard-item">
                <span class="rank">#${index + 1}</span>
                <span class="player-name">${score.player_name}</span>
                <span class="player-score">${score.score}</span>
            </div>
        `).join('');
        
        leaderboardList.innerHTML = html;
    }
    
    playAgain() {
        document.getElementById('gameOverModal').style.display = 'none';
        this.resetGame();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    game.draw(); // 绘制初始状态
});
