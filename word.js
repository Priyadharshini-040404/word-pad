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

document.getElementById("alignSelect").addEventListener("change", (e) => {
  const value = e.target.value;
  let command = "";
  switch (value) {
    case "left":
      command = "justifyLeft";
      break;
    case "center":
      command = "justifyCenter";
      break;
    case "right":
      command = "justifyRight";
      break;
    case "justify":
      command = "justifyFull";
      break;
  }
  editor.execCommand(command);
});

// Text Color
document.getElementById("textColor").addEventListener("input", (e) => {
  const color = e.target.value;
  editor.execCommand("foreColor", color);
});

// Highlight / Background Color
document.getElementById("highlightColor").addEventListener("input", (e) => {
  const color = e.target.value;
  editor.execCommand("hiliteColor", color);
});
// Unordered List
document.getElementById("ulBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("insertUnorderedList");
});
// Ordered List
document.getElementById("olBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("insertOrderedList");
});
document.getElementById("indentBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("indent");
});

// Decrease Indent
document.getElementById("outdentBtn").addEventListener("mousedown", (e) => {
  e.preventDefault();
  editor.execCommand("outdent");
});

// Tab switching
document.querySelectorAll(".tabBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active from all buttons
    document.querySelectorAll(".tabBtn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Hide all tab contents
    document.querySelectorAll(".tabContent").forEach((tab) => (tab.style.display = "none"));

    // Show the clicked tab's content
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(tabId).style.display = "block";
  });
});
// Insert Link
document.getElementById("linkBtn").addEventListener("click", () => {
  const url = prompt("Enter the URL:");
  if (url) {
    editor.execCommand("createLink", url);
  }
});
// Create hidden file input for image
const imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";
imageInput.style.display = "none";
document.body.appendChild(imageInput);

// Insert Image Button
document.getElementById("imageBtn").addEventListener("click", () => {
  imageInput.click(); // open file dialog
});

// When file is chosen
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgHTML = `<img src="${e.target.result}" style="max-width:200px;">`;
      editor.execCommand("insertHTML", imgHTML);
    };
    reader.readAsDataURL(file);
  }
});
document.getElementById("tableBtn").addEventListener("click", () => {
  const rows = parseInt(prompt("Number of rows?", 2));
  const cols = parseInt(prompt("Number of columns?", 2));
  if (rows > 0 && cols > 0) {
    let table = `<table border="1" style="border-collapse:collapse; width:80%; max-width:600px;">`;
    for (let r = 0; r < rows; r++) {
      table += "<tr>";
      for (let c = 0; c < cols; c++) {
        table += `<td style="padding:10px;">&nbsp;</td>`;
      }
      table += "</tr>";
    }
    table += "</table><br>";
    editor.execCommand("insertHTML", table);
  }
});
// Clear formatting (remove inline styles and formatting tags)
document.getElementById("clearFormattingBtn").addEventListener("click", () => {
  const html = editor.getHTML();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  function cleanNode(node) {
    if (node.nodeType === 1) { // Element
      node.removeAttribute("style");
      node.removeAttribute("class");
      Array.from(node.childNodes).forEach(cleanNode);

      // Optional: unwrap bold, italic, underline, headings
      if (["B","I","U","H1","H2","H3","SPAN"].includes(node.tagName)) {
        const parent = node.parentNode;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
      }
    }
  }

  cleanNode(tempDiv);
  editor.editor.innerHTML = tempDiv.innerHTML;
});

// Reset editor content
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the editor?")) {
    editor.reset();
  }
});

// Copy plain text
document.getElementById("copyTextBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(editor.getText())
    .then(() => alert("Text copied to clipboard"))
    .catch(err => alert("Failed to copy text"));
});

// Preview
document.getElementById("previewBtn").addEventListener("click", () => {
  const modal = document.getElementById("previewModal");
  const content = document.getElementById("previewContent");
  content.innerHTML = editor.getHTML();
  modal.style.display = "flex";
});

// Close preview
document.getElementById("closePreview").addEventListener("click", () => {
  document.getElementById("previewModal").style.display = "none";
});

