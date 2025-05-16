const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    create: create,
  }
};
const game = new Phaser.Game(config);
function create() {
  // 三輪容器
  this.reels = [];
  for(let i=0;i<3;i++){
    this.reels[i] = this.add.text(
      config.width/4*(i+1), config.height/2,
      Math.floor(Math.random()*10), { fontSize: '128px', color: '#fff' }
    ).setOrigin(0.5);
  }
  this.input.once('pointerdown', spin, this);
}
function spin() {
  this.reels.forEach((r, i) => {
    this.tweens.add({
      targets: r,
      y: { from: 0, to: 360 },
      duration: 1000 + i*200,
      ease: 'Cubic.easeOut',
      onComplete: ()=> r.setText(Math.floor(Math.random()*10))
    });
  });
}
