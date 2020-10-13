class DotsAndBoxesGame {
  constructor(n) {
    this.n = n;
  }

  getInitBoard() {
    let b = new Board(this.n);
    return b.pieces;
  }

  getBoardSize() {
    // (a,b) tuple
    return [2*this.n+1, this.n+1];
  }

  getActionSize() {
    // return number of actions
    return 2 * (this.n + 1) * this.n + 1;
  }

  getNextState(board, player, action) {
    // if player takes action on board, return next (board,player)
    // action must be a valid move
    let b = new Board(this.n);
    b.pieces = b.clone(board);
    let up, down, left, right;
    if (action == this.getActionSize() - 1) {
      b.pieces[2][b.pieces[2].length-1] = 0;
    } else {
      [up, down, left, right] = b.execute_move(action, player);
    }
    return [b.pieces, -player, up, down, left, right];
  }

  getValidMoves(board, player) {
    // return a fixed size binary vector
    let b = new Board(this.n);
    b.pieces = board;
    return b.get_legal_moves(player);
  }

  getGameEnded(board, player) {
    // return 0 if not ended, 1 if player 1 won, -1 if player 1 lost
    let b = new Board(this.n);
    b.pieces = board;
    if (b.has_legal_moves()) {
      return 0;
    }
    let pieces = board;
    let last_column = pieces[0].length-1;
    if (pieces[0][last_column] == pieces[1][last_column]) {
      return -1 * player;
    } else {
      let player_1_won = pieces[0][last_column] > pieces[1][last_column];
      return player_1_won ? 1*player : -1*player;
    }
  }

  getCanonicalForm(board, player) {
    let b = new Board(this.n);
    board = b.clone(board);
    if (player == -1) {
      // swap score
      let last_column = board[0].length-1;
      let aux = board[0][last_column];
      board[0][last_column] = board[1][last_column];
      board[1][last_column] = aux;
    }
    return board;
  }

  predict(nnet, board) {
    board = new Board(this.n).clone(board);

    let last_column = board[0].length-1;

    // Need to normalize score
    let p1_score = board[0][last_column];
    let p2_score = board[1][last_column];
    let score = p1_score - p2_score;

    let max_score = this.n * this.n;
    let min_score = -1 * max_score;

    let max_normalized = 1;
    let min_normalized = 0; 
    let normalized_score = ((score - max_score) / (min_score - max_score)) * (min_normalized - max_normalized) + max_normalized;

    board[0][last_column] = normalized_score;
    board[1][last_column] = 0;

    let board_size = this.getBoardSize();
    board_size.unshift(1);
    let prediction = nnet.predict(tf.tensor(board).reshape(board_size));
    return prediction;
  }

  stringRepresentation(board) {
    return board.toString();
  }

}