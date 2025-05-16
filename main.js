const REEL_COUNT = 3;
const SPIN_DURATION = 3000;
const SPIN_DELAY = 1000;
const LENGTH = [4,10,10];

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x000000,
  scene: { create: create }
};

const game = new Phaser.Game(config);

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  this.reels = [];
  const reelWidth = 150;
  const reelHeight = 200;
  const numberHeight = reelHeight / 3;
  
  for (let i = 0; i < REEL_COUNT; i++) {
    const x = centerX - (REEL_COUNT * reelWidth) / 2 + i * reelWidth + reelWidth/2;
    const y = centerY - 50;
    

    this.add.rectangle(x, y, reelWidth, reelHeight, 0x000000, 0)
      .setStrokeStyle(4, 0xffffff);
    
    
    const container = this.add.container(x, y);

    const numbers = [];
    for (let j = -1; j <= 2; j++) {
      const num = this.add.text(0, j * numberHeight, '0', 
        { fontSize: '60px', color: '#ffffff', fontFamily: 'Arial' }
      ).setOrigin(0.5);
      container.add(num);
      numbers.push(num);
    }
    
    this.add.rectangle(x, y + reelHeight + 2, reelWidth, reelHeight, 0x222222, 1)
    this.add.rectangle(x, y - reelHeight - 2, reelWidth, reelHeight, 0x222222, 1)
    
    this.reels.push({
      container: container,
      numbers: numbers,
      x: x,
      y: y,
      width: reelWidth,
      height: numberHeight,
      value: 0,
      isSpinning: false,
      tween: null,
      step: 0
    });
    
    // 初始化數字
    updateReelNumbers(this.reels[i], i);
  }
  
  // 建立SPIN按鈕
  const spinBtn = this.add.text(centerX, centerY + 180, 'SPIN', 
    { 
      fontSize: '48px', 
      color: '#ffffff',
      backgroundColor: '#ff3333', 
      padding: { x: 30, y: 15 },
      fontFamily: 'Arial'
    }
  ).setOrigin(0.5).setInteractive();
  
  spinBtn.on('pointerdown', () => {
    if (this.reels.some(reel => reel.isSpinning)) return;
    spinBtn.disableInteractive();
    spinReels.call(this, () => spinBtn.setInteractive());
  });
}

// 更新滾輪上的數字
function updateReelNumbers(reel, i) {
  reel.value += 1;
  const current = reel.value;
  reel.numbers[0].setText((current + 1) % LENGTH[i]);
  reel.numbers[1].setText(current % LENGTH[i]);
  reel.numbers[2].setText((current - 1) % LENGTH[i]);
  reel.numbers[3].setText((current - 2) % LENGTH[i]);
}

function spinReels(onComplete) {
  let completedReels = 0;
  
  for (let i = 0; i < this.reels.length; i++) {
    const reel = this.reels[i];
    reel.isSpinning = true;
    reel.step = 0;
    
    if (reel.tween) reel.tween.remove();
    
    const targetValue = Phaser.Math.Between(0, 9);
    const spinCount = 1 + Phaser.Math.Between(0, 0);
    
    const totalMovement = spinCount * LENGTH[i] + (targetValue - reel.value) + 1;
    
    reel.tween = this.tweens.add({
      targets: reel.numbers,
      y: `+=${(totalMovement * reel.height)}`,
      duration: SPIN_DURATION + i * SPIN_DELAY,
      delay: i * SPIN_DELAY,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        while(reel.numbers[1].y - reel.step * reel.height > 0){
          reel.step += 1;
          updateReelNumbers(reel, i);
        }
        reel.numbers[0].y -= reel.step * reel.height / 4
        reel.numbers[1].y -= reel.step * reel.height / 3
        reel.numbers[2].y -= reel.step * reel.height / 2
        reel.numbers[3].y -= reel.step * reel.height
      },
      onComplete: () => {
        reel.numbers[0].y = -reel.height;
        reel.numbers[1].y = 0;
        reel.numbers[2].y = reel.height;
        reel.numbers[3].y = reel.height * 2;
        reel.value = targetValue;
        updateReelNumbers(reel, i);
        
        reel.isSpinning = false;
        completedReels++;
        
        if (completedReels === this.reels.length && onComplete) {
          onComplete();
        }
      }
    });
  }
}
