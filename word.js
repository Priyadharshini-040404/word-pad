class Editor {
  constructor(editorElement) {
    this.editor = editorElement;
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
}

// Initialize editor
const editor = new Editor(document.getElementById("editor"));

// Toolbar buttons
document.getElementById("boldBtn").addEventListener("click", () => {
  document.execCommand("bold", false, null);
});

document.getElementById("italicBtn").addEventListener("click", () => {
  document.execCommand("italic", false, null);
});

document.getElementById("underlineBtn").addEventListener("click", () => {
  document.execCommand("underline", false, null);
});
