class Board {

  constructor(n) {
    this.n = n;
    this.pieces = new Array(2*n+1).fill(new Array(n+1).fill(0)).map((x) => [...x]);
  }

  clone(board) {
    return [...board].map((x) => [...x]);
  }

  increase_score(score, player) {
    let a = this.clone(this.pieces);
    a[player == 1 ? 0 : 1][a[0].length-1] += score;
    this.pieces = a;
  }

  is_pass_on() {
    let a = this.pieces;
    return a[2][a[0].length-1];
  }

  toggle_pass(state) {
    let a = this.clone(this.pieces);
    a[2][a[0].length-1] = state;
    this.pieces = a;
  }

  flatten() {
    let values = this.clone(this.pieces).map((x) => x.map((y)=>+(!y)));
    let flatten = [];
    for (let i = 0; i <= this.n; i++) {
      values[i].pop();
      flatten = flatten.concat(values[i]);
    }
    for (let i = this.n+1; i <= 2*this.n; i++) {
      flatten = flatten.concat(values[i]);
    }
    return flatten;
  }

  get_legal_moves(color) {
    let flatten = this.flatten();
    flatten = flatten.concat([0]);
    if (this.is_pass_on()) {
      flatten = new Array(flatten.length);
      flatten.fill(0);
      flatten[flatten.length-1] = 1;
    }
    return flatten;
  }

  has_legal_moves() {
    let flatten = this.flatten();
    return flatten.reduce((a,c)=>a||c);
  }

  execute_move(action, color) {
    let x, y;
    let is_horizontal = action < this.n*(this.n+1);
    if (is_horizontal) {
      x = parseInt(action / this.n);
      y = action % this.n;
    } else {
      action -= this.n*(this.n+1);
      x = parseInt(action / (this.n+1)) + this.n + 1;
      y = action % (this.n+1);
    }

    let values = this.clone(this.pieces);
    values[x][y] = 1;
    this.pieces = this.clone(values);

    let filler = new Array(values.length).fill(0);
    values.map((x) => {x.push(0); x.unshift(0)});
    let horizontal = [filler];
    for (let i = 0; i <= this.n; i++) {
      values[i][values[i].length-1] = 0;
      horizontal.push(values[i]);
    }
    horizontal.push(filler);

    let vertical = [filler];
    for (let i = this.n+1; i <= 2*this.n; i++) {
      vertical.push(values[i]);
    }
    vertical.push(filler);

    // Need to check if we have closed a square
    // If so, increase score and mark pass
    let score = 0;
    let up, down, left, right;
    up = 0;
    down = 0;
    left = 0;
    right = 0;
    if (is_horizontal) {
      x++;
      y++;
      if (horizontal[x+1][y]) {
        down = (vertical[x][y] && vertical[x][y+1]);
      }
      if (horizontal[x-1][y]) {
        up = (vertical[x-1][y] && vertical[x-1][y+1]);
      }
    } else {
      x -= this.n;
      y++;
      if (vertical[x][y+1]) {
        right = (horizontal[x][y] && horizontal[x+1][y]);
      }
      if (vertical[x][y-1]) {
        left = (horizontal[x][y-1] && horizontal[x+1][y-1]);
      }
    }
    score = up + down + left + right;
    this.increase_score(score, color);
    this.toggle_pass(+(score > 0));
    return [up, down, left, right];
  }

}