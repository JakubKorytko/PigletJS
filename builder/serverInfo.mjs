import CONST from "../misc/CONST.mjs";

class ServerInfo {
  constructor() {
    this.columns = [[], [], [], []];
    this.columnNames = ["Watcher", "Generated", "Errors", "Updates"];
    this.bottom = [[], [], []];

    // Set up keypress listeners
    process.stdin.setRawMode(true);
    process.stdin.on("data", (data) => {
      if (data.toString().trim() === "q" || data.toString() === "\x03") {
        process.exit(0);
      }
    });

    // Set up resize listener
    process.stdout.on("resize", () => {
      this.render();
    });

    // Initial render
    this.render();

    // Default values
    this.pushToColumn(3, "Server start");
    this.setBottom(0, `Connected clients: 0`);
    this.setBottom(1, `PORT: 3000`);
  }

  getTerminalSize() {
    return {
      width: process.stdout.columns || 80,
      height: process.stdout.rows - 2 || 24,
    };
  }

  centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(padding) + text;
  }

  drawBoxLine(width, left, mid, right) {
    return left + mid.repeat(width - 2) + right;
  }

  padCell(text, width) {
    return " " + text.slice(0, width - 2).padEnd(width - 2) + " ";
  }

  render() {
    const { width, height } = this.getTerminalSize();

    const colCount = 4;
    const bottomCount = 3;
    const colWidth = Math.floor((width - 5) / 4);

    const rowsPerCol = Math.max(0, height - 6);

    process.stdout.write("\x1Bc");

    console.log(
      CONST.consoleCodes.colors.orange,
      this.centerText("╔══════════════ PigletJS Server ══════════════╗", width),
      CONST.consoleCodes.colorReset,
    );
    console.log();
    process.stdout.write(CONST.consoleCodes.colorReset);

    // Column names
    process.stdout.write(CONST.consoleCodes.colors.yellow);
    let nameLine = " ";
    for (let i = 0; i < colCount; i++) {
      nameLine += this.padCell(this.columnNames[i], colWidth);
      if (i !== colCount - 1) nameLine += " ";
    }
    console.log(nameLine);
    process.stdout.write(CONST.consoleCodes.colorReset);

    // Top border
    console.log(
      CONST.consoleCodes.colors.orange +
        this.drawBoxLine(width, "╭", "─", "╮") +
        CONST.consoleCodes.colorReset,
    );

    // Rows for each column
    for (let row = 0; row < rowsPerCol; row++) {
      let line = `${CONST.consoleCodes.colors.orange}│${CONST.consoleCodes.colorReset}`;

      for (let col = 0; col < colCount; col++) {
        const stack = this.columns[col];
        let item = stack[row] ?? "";
        const emoji = item.match(/\p{Extended_Pictographic}/gu);

        if (emoji) {
          const size = String.raw`${emoji}`.length;
          item = item.slice(size + 1);
        }

        line += this.padCell(item, colWidth);
        if (col !== colCount - 1) line += " ";
      }

      const lineLength =
        line.length -
        CONST.consoleCodes.colors.orange.length -
        CONST.consoleCodes.colorReset.length;

      line +=
        CONST.consoleCodes.colors.orange +
        "│".padStart(width - lineLength, " ") +
        CONST.consoleCodes.colorReset;
      process.stdout.write(line);
    }

    // Bottom border
    console.log(
      CONST.consoleCodes.colors.orange +
        this.drawBoxLine(width, "╰", "─", "╯") +
        CONST.consoleCodes.colorReset,
    );
    console.log();

    // Bottom section (3 columns)
    process.stdout.write(CONST.consoleCodes.colors.yellow);
    const bottomColWidth = Math.floor(
      (width - (bottomCount - 1)) / bottomCount,
    );
    let bottomLine = "";
    for (let i = 0; i < bottomCount; i++) {
      bottomLine += this.padCell(this.bottom[i][0] ?? "", bottomColWidth);
      if (i !== bottomCount - 1) bottomLine += " ";
    }
    console.log(this.centerText(bottomLine, width));
    process.stdout.write(CONST.consoleCodes.colorReset);
  }

  pushToColumn(index, value) {
    if (index < 0 || index >= 4) throw new Error("Column index must be 0–3");
    this.columns[index].unshift(value);
    this.columns[index] = this.columns[index].slice(
      0,
      this.getTerminalSize().height - 6,
    );
    this.render();
  }

  setBottom(index, value) {
    if (index < 0 || index >= 3) throw new Error("Bottom index must be 0–2");
    this.bottom[index][0] = value;
    this.render();
  }
}

export default ServerInfo;
