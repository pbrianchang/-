const REEL_COUNT = 3;      // 幾個滾輪
const SYMBOL_COUNT = 10;   // 符號(0~9)
const VISIBLE = 3;         // 每格可見數字個數
const SPIN_DURATION = 1000;// 每輪動畫基底時間

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x808080,  // 灰色背景
  scene: { create: create }
};

const game = new Phaser.Game(config);

function create() {
  const { width, height } = this.sys.game.config;
  const reelWidth = width / REEL_COUNT * 0.8;
  const reelHeight = height * 0.6;
  const reelX0 = width * 0.1;
  const reelY0 = height * 0.1;

  this.reels = [];

  for (let i = 0; i < REEL_COUNT; i++) {
    // Container & mask
    const container = this.add.container(
      reelX0 + i * (reelWidth + 20),
      reelY0
    );
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRoundedRect(0, 0, reelWidth, reelHeight, 10);
    const mask = maskShape.createGeometryMask();
    container.setMask(mask);

    // 白色方框外框
    this.add
      .graphics()
      .lineStyle(4, 0xffffff)
      .strokeRoundedRect(
        reelX0 + i * (reelWidth + 20),
        reelY0,
        reelWidth,
        reelHeight,
        10
      );

    // 橫線分隔
    for (let j = 1; j < VISIBLE; j++) {
      this.add
        .line(
          reelX0 + i * (reelWidth + 20),
          reelY0 + (reelHeight / VISIBLE) * j,
          0, 0,
          reelWidth, 0,
          0xcccccc
        )
        .setLineWidth(2);
    }

    // 建立 SYMBOL_COUNT 個文字，垂直堆疊
    const texts = [];
    for (let s = 0; s < SYMBOL_COUNT + VISIBLE; s++) {
      const num = Phaser.Math.Between(0, SYMBOL_COUNT - 1);
      const txt = this.add.text(
        reelWidth / 2,
        s * (reelHeight / VISIBLE) - (reelHeight / VISIBLE),
        num,
        { fontSize: `${reelHeight / VISIBLE * 0.6}px`, color: '#000' }
      ).setOrigin(0.5, 0.5);
      container.add(txt);
      texts.push(txt);
    }

    this.reels.push({ container, texts, reelHeight });
  }

  // SPIN 按鈕
  const btn = this.add.text(width/2, height*0.85, 'SPIN', {
    fontSize: '48px',
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: { x:20, y:10 },
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  btn.on('pointerdown', () => {
    btn.disableInteractive();
    spinReels.call(this, () => {
      btn.setInteractive({ useHandCursor: true });
    });
  });
}

function spinReels(onComplete) {
  this.reels.forEach((reel, i) => {
    const { container, texts, reelHeight } = reel;
    // 每輪 tween
    this.tweens.add({
      targets: texts,
      y: `+=${reelHeight}`,            // 向下移動一格(回到起點)
      duration: SPIN_DURATION + i*200, // 依序慢一點
      ease: 'Cubic.easeOut',
      repeat: 3,                       // 重複次數越多，看起來越快
      onRepeat: () => {
        // 每次重複，最上方移到最下方，並隨機改數字
        const first = texts.shift();
        first.y = texts[texts.length-1].y + (reelHeight / VISIBLE);
        first.setText(Phaser.Math.Between(0, SYMBOL_COUNT - 1));
        texts.push(first);
      },
      onComplete: () => {
        // 最後確保每個格子只留VISIBLE個
        texts.forEach((txt, idx) => {
          txt.y = idx * (reelHeight / VISIBLE) + (reelHeight / VISIBLE/2);
        });
        if (i === this.reels.length - 1 && onComplete) {
          onComplete();
        }
      }
    });
  });
}
