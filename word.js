// Editor class
class Editor {
  constructor(editorElement) {
    this.editor = editorElement;

    // Ensure new lines after heading are normal
    this.editor.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        let block = range.startContainer;

        while (block && block !== this.editor && block.nodeName !== "DIV" && block.nodeName !== "P" && block.nodeName[0] !== "H") {
          block = block.parentNode;
        }

        // If current block is a heading
        if (block && block.nodeName[0] === "H") {
          e.preventDefault(); // prevent default enter
          
          // Insert new paragraph
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          if (block.nextSibling) {
            block.parentNode.insertBefore(p, block.nextSibling);
          } else {
            block.parentNode.appendChild(p);
          }

          // Move cursor to new paragraph
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);

          // Update dropdown to Normal
          document.getElementById("headingSelect").value = "p";
        }
      }
    });

    // Sync heading dropdown when cursor moves
    this.editor.addEventListener("keyup", () => this.updateHeadingDropdown());
    this.editor.addEventListener("mouseup", () => this.updateHeadingDropdown());
  }

  updateHeadingDropdown() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    let block = sel.anchorNode;
    while (block && block !== this.editor && block.nodeName !== "DIV" && block.nodeName !== "P" && block.nodeName[0] !== "H") {
      block = block.parentNode;
    }
    if (!block) return;
    const tag = block.nodeName.toLowerCase();
    const dropdown = document.getElementById("headingSelect");
    if (["p", "h1", "h2", "h3"].includes(tag)) {
      dropdown.value = tag;
    } else {
      dropdown.value = "p";
    }
  }

  getHTML() {
    return this.editor.innerHTML;
  }

  getText() {
    return this.editor.innerText;
  }

  reset() {
    this.editor.innerHTML = "";
  }

  execCommand(command, value = null) {
    this.editor.focus();
    document.execCommand(command, false, value);
  }
}

// Initialize editor
const editor = new Editor(document.getElementById("editor"));

// Toolbar buttons
document.getElementById("boldBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("bold");
});
document.getElementById("italicBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("italic");
});
document.getElementById("underlineBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("underline");
});

// Headings
document.getElementById("headingSelect").addEventListener("change", (e) => {
  const tag = e.target.value;
  editor.editor.focus();
  document.execCommand("formatBlock", false, tag);
});

// Font family
document.getElementById("fontSelect").addEventListener("change", (e) => {
  editor.execCommand("fontName", e.target.value);
});

// Font size
document.getElementById("fontSizeSelect").addEventListener("change", (e) => {
  editor.execCommand("fontSize", e.target.value);
});
