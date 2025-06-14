window.onload = function () {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 640;
  document.body.style.margin = '0';
  document.body.appendChild(canvas);

  const TILE_SIZE = 32;
  let mapData = null;
  let tileset = new Image();
  tileset.src = 'assets/tileset.png';

  let player = {
    x: 10,
    y: 10,
    moving: false,
    moveTo: { x: 10, y: 10 },
    draw(ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    },
    update() {
      if (this.x < this.moveTo.x) this.x += 1;
      else if (this.x > this.moveTo.x) this.x -= 1;
      else if (this.y < this.moveTo.y) this.y += 1;
      else if (this.y > this.moveTo.y) this.y -= 1;
      else this.moving = false;
    }
  };

  const keys = {};
  window.addEventListener('keydown', e => keys[e.key] = true);
  window.addEventListener('keyup', e => keys[e.key] = false);

  fetch('assets/map.json')
    .then(res => res.json())
    .then(json => {
      mapData = json;
      requestAnimationFrame(gameLoop);
    });

  function drawMap() {
    if (!mapData) return;
    const layer = mapData.layers[0];
    const tw = mapData.tilewidth;
    const th = mapData.tileheight;
    for (let i = 0; i < layer.data.length; i++) {
      const x = (i % mapData.width) * tw;
      const y = Math.floor(i / mapData.width) * th;
      const tile = layer.data[i];
      ctx.fillStyle = tile === 0 ? '#2a2a2a' : '#777'; // fondo oscuro para vacíos, gris para bordes
      ctx.fillRect(x, y, tw, th);
    }
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!player.moving) {
      if (keys['ArrowUp']) tryMove(0, -1);
      else if (keys['ArrowDown']) tryMove(0, 1);
      else if (keys['ArrowLeft']) tryMove(-1, 0);
      else if (keys['ArrowRight']) tryMove(1, 0);
    } else {
      player.update();
    }
    drawMap();
    player.draw(ctx);
    requestAnimationFrame(gameLoop);
  }

  function tryMove(dx, dy) {
    const tx = player.moveTo.x + dx;
    const ty = player.moveTo.y + dy;
    if (tx >= 0 && tx < mapData.width && ty >= 0 && ty < mapData.height) {
      const index = ty * mapData.width + tx;
      const tile = mapData.layers[0].data[index];
      if (tile === 0) {
        player.moveTo = { x: tx, y: ty };
        player.moving = true;
      }
    }
  }
};
