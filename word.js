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
// Clear formatting (remove inline styles, keep headings/bold/italic/underline)
document.getElementById("clearFormatBtn").addEventListener("click", () => {
  const html = editor.getHTML();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  function cleanNode(node) {
    if (node.nodeType === 1) { // Element
      node.removeAttribute("style");
      node.removeAttribute("class");
      Array.from(node.childNodes).forEach(cleanNode);

      // Only unwrap SPAN (keep semantic tags like B, I, U, H1, H2, H3)
      if (["SPAN"].includes(node.tagName)) {
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

// Toggle File dropdown
document.getElementById("fileTabBtn").addEventListener("click", () => {
  const dropdown = document.getElementById("fileDropdown");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});
// Hide dropdown if clicked outside
document.addEventListener("click", (e) => {
  const fileBtn = document.getElementById("fileTabBtn");
  const dropdown = document.getElementById("fileDropdown");
  if (!fileBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
  }
});
// Save as DOC
document.getElementById("saveDocBtn").addEventListener("click", () => {
  const content = document.getElementById("editor").innerHTML;
  const title = document.getElementById("docTitle").value || "Untitled";
  const author = document.getElementById("docAuthor").value || "Unknown";
  const wordHeader = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office'
        xmlns:w='urn:schemas-microsoft-com:office:word'
        xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <!-- Word-specific metadata -->
    <xml>
      <w:WordDocument>
        <w:Author>${author}</w:Author>
        <w:Title>${title}</w:Title>
      </w:WordDocument>
    </xml>
  </head>
  <body>
    ${content}
  </body>
  </html>`;
  const blob = new Blob([wordHeader], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = title + ".doc";
  link.click();
});
// Save as PDF
document.getElementById("savePdfBtn").addEventListener("click", () => {
  const element = document.getElementById("editor");
  const title = document.getElementById("docTitle").value || "Untitled";
  const author = document.getElementById("docAuthor").value || "Unknown";

  const opt = {
    margin: 0.5,
    filename: title + ".pdf",
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      pdf.setProperties({
        title: title,
        author: author,
        subject: "Mini WordPad Export",
        keywords: "WordPad, Editor, Export, PDF",
        creator: "Mini WordPad"
      });
    })
    .save();
});
let matches = [];      // all found ranges
let currentMatch = -1; // index of currently highlighted match
let currentRange = null;

// Clear current highlight
function clearHighlight() {
  const sel = window.getSelection();
  sel.removeAllRanges();
  currentRange = null;
}

// Build matches for current search term (partial matches allowed)
function buildMatches(searchText) {
  matches = [];
  currentMatch = -1;
  if (!searchText) return;

  const walker = document.createTreeWalker(editor.editor, NodeFilter.SHOW_TEXT);
  const regex = new RegExp(searchText, "gi"); // remove \b for partial matches
  let node;
  while (node = walker.nextNode()) {
    let match;
    while ((match = regex.exec(node.textContent)) !== null) {
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      matches.push(range);
    }
  }
}

// Highlight the next match
function highlightNext() {
  if (matches.length === 0) return alert("No matches found");
  clearHighlight();
  currentMatch = (currentMatch + 1) % matches.length;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(matches[currentMatch]);
  currentRange = matches[currentMatch];
  currentRange.startContainer.parentNode.scrollIntoView({behavior:"smooth", block:"center"});
}

// Find Next button
document.getElementById("findBtn").addEventListener("click", () => {
  const searchText = document.getElementById("findInput").value;
  if (!searchText) return;

  // If new search term, rebuild matches
  if (!matches.length || searchText.toLowerCase() !== document.getElementById("findInput").dataset.lastSearch) {
    buildMatches(searchText);
    document.getElementById("findInput").dataset.lastSearch = searchText.toLowerCase();
  }
  highlightNext();
});

// Replace currently highlighted occurrence
document.getElementById("replaceBtn").addEventListener("click", () => {
  if (!currentRange) return alert("No text selected to replace");
  const replaceText = document.getElementById("replaceInput").value;
  currentRange.deleteContents();
  currentRange.insertNode(document.createTextNode(replaceText));
  clearHighlight();

  // After replace, remove this match and adjust currentMatch index
  matches.splice(currentMatch, 1);
  currentMatch--; // decrement so next highlightNext() highlights the correct next match
});

// Replace All
document.getElementById("replaceAllBtn").addEventListener("click", () => {
  const searchText = document.getElementById("findInput").value;
  const replaceText = document.getElementById("replaceInput").value;
  if (!searchText) return;

  const walker = document.createTreeWalker(editor.editor, NodeFilter.SHOW_TEXT);
  const regex = new RegExp(searchText, "gi"); // partial matches
  let node;
  while (node = walker.nextNode()) {
    node.textContent = node.textContent.replace(regex, replaceText);
  }

  matches = [];
  currentMatch = -1;
  clearHighlight();
});





