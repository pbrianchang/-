const REEL_COUNT = 3;                                 // 滾輪數量
const SYMBOL_COUNT = 10;                              // 符號總數 (0~9)
const VISIBLE = 1;                                    // 可見格子數 (框內只顯示 1 個)
const SPIN_DURATION = 1000;                           // 基礎動畫時間 (ms)

const config = {                                      // Phaser 初始化設定
  type: Phaser.AUTO,                                  // 自動選擇 WebGL 或 Canvas
  width: window.innerWidth,                          // 畫布寬度 = 視窗寬度
  height: window.innerHeight,                        // 畫布高度 = 視窗高度
  backgroundColor: 0x808080,                         // 背景灰色
  scene: { create: create }                          // 指定 create 階段函式
};

const game = new Phaser.Game(config);                 // 啟動 Phaser 遊戲

function create() {                                   // 場景建立時呼叫
  const { width, height } = this.sys.game.config;     // 取得畫布尺寸
  const reelW = width / REEL_COUNT * 0.8;             // 單個滾輪寬度
  const reelH = height * 0.6;                         // 單個滾輪高度 (一格高度)
  const startX = width * 0.1;                         // 第一個滾輪 X 座標
  const startY = height * 0.2;                        // 滾輪 Y 座標

  this.reels = [];                                     // 儲存所有滾輪資料

  for (let i = 0; i < REEL_COUNT; i++) {               // 迭代建立每個滾輪
    const container = this.add.container(startX + i * (reelW + 20), startY); // 建立 container 並定位
    const maskG = this.make.graphics();                // 建 mask 的 Graphics
    maskG.fillStyle(0xffffff).fillRect(0, 0, reelW, reelH); // 畫白色遮罩區域
    const mask = maskG.createGeometryMask();           // 產生遮罩
    container.setMask(mask);                           // 套用遮罩

    // 白色外框 (只畫框線，不加入 container)
    this.add.graphics().lineStyle(4, 0xffffff).strokeRect(startX + i * (reelW + 20), startY, reelW, reelH);

    // 在 container 中畫橫線 (因只顯示一格，這裡上下邊界線)
    const lineTop = this.add.line(0, 0, 0, 0, reelW, 0, 0x000000).setOrigin(0, 0); // 上框線
    const lineBot = this.add.line(0, reelH, 0, 0, reelW, 0, 0x000000).setOrigin(0, 0); // 下框線
    container.add([lineTop, lineBot]);                // 把線加入 container

    // 建立 SYMBOL_COUNT+VISIBLE 個文字並垂直堆疊 (多一格用以循環)
    const texts = [];
    for (let s = 0; s < SYMBOL_COUNT + VISIBLE; s++) {
      const num = Phaser.Math.Between(0, SYMBOL_COUNT - 1); // 隨機數字
      const txt = this.add.text(reelW/2, s * reelH, num, { fontSize: `${reelH*0.8}px`, color: '#000' }).setOrigin(0.5, 0.5); // 文字
      container.add(txt);                               // 加入 container
      texts.push(txt);                                  // 存到陣列
    }

    this.reels.push({ container, texts, reelH });       // 存滾輪資料
  }

  // 建立 SPIN 按鈕
  const btn = this.add.text(width/2, height*0.85, 'SPIN', { fontSize: '48px', backgroundColor: '#ffffff', color: '#000000', padding: { x:20, y:10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }); // 按鈕

  btn.on('pointerdown', () => {                         // 按下時
    btn.disableInteractive();                           // 鎖住按鈕
    spinReels.call(this, () => btn.setInteractive({ useHandCursor: true })); // 執行轉動，完成後解鎖
  });
}

function spinReels(onComplete) {                        // 轉動所有滾輪
  this.reels.forEach((reel, i) => {                     // 每個滾輪
    const { texts, reelH } = reel;                      // 解構
    this.tweens.add({                                   // Tween 動畫
      targets: texts,                                   // 目標為文字陣列
      y: `+=${reelH}`,                                  // 向下移動一個格子高度
      duration: SPIN_DURATION + i * 200,                // 時間依序延長
      ease: 'Cubic.easeOut',                            // 緩動函式
      repeat: 5,                                        // 重複次數 (轉更多圈)
      onRepeat: () => {                                 // 每次重複
        const first = texts.shift();                    // 取出最上方文字
        first.y = texts[texts.length-1].y + reelH;     // 放到最下方
        first.setText(Phaser.Math.Between(0, SYMBOL_COUNT - 1)); // 更新數字
        texts.push(first);                              // 加回陣列尾
      },
      onComplete: () => {                               // 單輪完成
        texts.forEach((txt, idx) => txt.y = idx * reelH + reelH/2); // 重排中間對齊
        if (i === this.reels.length - 1 && onComplete) onComplete(); // 最後一輪完成後呼叫 callback
      }
    });
  });
}
