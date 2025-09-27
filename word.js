// Editor class
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

  // Make sure editor is focused before execCommand
  execCommand(command) {
    this.editor.focus();
    document.execCommand(command, false, null);
  }
}

// Initialize editor
const editor = new Editor(document.getElementById("editor"));

// Toolbar buttons
document.getElementById("boldBtn").addEventListener("click", () => {
  editor.execCommand("bold");
});

document.getElementById("italicBtn").addEventListener("click", () => {
  editor.execCommand("italic");
});

document.getElementById("underlineBtn").addEventListener("click", () => {
  editor.execCommand("underline");
});
