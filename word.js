// Editor class
class Editor {
  constructor(editorElement) {
    this.editor = editorElement;
    this.editor.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        let block = range.startContainer;

        while (block && block !== this.editor && block.nodeName !== "DIV" && block.nodeName !== "P" && block.nodeName[0] !== "H") {
          block = block.parentNode;
        }
        if (block && block.nodeName[0] === "H") {
          e.preventDefault(); 
          const p = document.createElement("p");
          p.innerHTML = "<br>";
          if (block.nextSibling) {
            block.parentNode.insertBefore(p, block.nextSibling);
          } else {
            block.parentNode.appendChild(p);
          }
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.getElementById("headingSelect").value = "p";
        }
      }
    });
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
const editor = new Editor(document.getElementById("editor"));
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
    document.querySelectorAll(".tabBtn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tabContent").forEach((tab) => (tab.style.display = "none"));
    const tabId = btn.getAttribute("data-tab");
    document.getElementById(tabId).style.display = "block";
  });
});
// Insert Link
document.getElementById("linkBtn").addEventListener("click", () => {
  showInputModal("Enter the URL:", "", (url) => {
    if (!url) {
      showToast("Link insertion cancelled");
      return;
    }
    editor.execCommand("createLink", url);
    showToast("Link inserted successfully");
  });
});
// IMAGE INSERT WITH CONTEXT MENU //
const imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";
imageInput.style.display = "none";
document.body.appendChild(imageInput);
document.getElementById("imageBtn").addEventListener("click", () => {
  imageInput.value = "";
  imageInput.click();
});
const menu = document.createElement("div");
menu.id = "imgContextMenu";
menu.style.position = "absolute";
menu.style.display = "none";
menu.style.background = "#fff";
menu.style.border = "1px solid #ccc";
menu.style.padding = "5px";
menu.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
menu.style.zIndex = "2000";
menu.innerHTML = `
  <div class="menu-item" data-action="resize">Resize</div>
  <div class="menu-item" data-action="crop">Crop</div>
  <div class="menu-item" data-action="delete">Delete</div>
`;
document.body.appendChild(menu);
document.addEventListener("click", () => (menu.style.display = "none"));
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const span = document.createElement("span");
    span.className = "img-wrapper";
    span.id = "img-" + Date.now();
    span.contentEditable = "false";
    span.style.display = "inline-block";
    span.style.position = "relative";
    span.style.margin = "5px";
    const img = document.createElement("img");
    img.src = e.target.result;
    img.style.width = "200px";
    img.style.height = "auto";
    img.style.display = "block";
    span.appendChild(img);
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      range.setStartAfter(span);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    span.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      menu.style.left = ev.pageX + "px";
      menu.style.top = ev.pageY + "px";
      menu.style.display = "block";
      menu.dataset.targetId = span.id;
    });
  };
  reader.readAsDataURL(file);
});
menu.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  const target = document.getElementById(menu.dataset.targetId);
  if (!target) return;
  const img = target.querySelector("img");

  if (action === "delete") {
    target.remove();
  } else if (action === "resize") {
    enableResize(img);
  } else if (action === "crop") {
    enableCrop(img);
  }
  menu.style.display = "none";
});
function enableResize(img) {
  const handle = document.createElement("span");
  handle.className = "resize-handle";
  handle.style.position = "absolute";
  handle.style.width = "10px";
  handle.style.height = "10px";
  handle.style.background = "#0078d7";
  handle.style.right = "0";
  handle.style.bottom = "0";
  handle.style.cursor = "se-resize";
  img.parentNode.appendChild(handle);
  handle.addEventListener("mousedown", (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    let startX = ev.clientX;
    let startY = ev.clientY;
    let startWidth = img.offsetWidth;
    let startHeight = img.offsetHeight;
    function onMouseMove(e) {
      img.style.width = startWidth + (e.clientX - startX) + "px";
      img.style.height = startHeight + (e.clientY - startY) + "px";
    }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      handle.remove();
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}
function enableCrop(img) {
  const wrapper = img.parentNode;
  wrapper.style.position = "relative";
  const cropBox = document.createElement("div");
  cropBox.style.position = "absolute";
  cropBox.style.border = "2px dashed red";
  cropBox.style.background = "rgba(255,0,0,0.1)";
  cropBox.style.left = "20px";
  cropBox.style.top = "20px";
  cropBox.style.width = "100px";
  cropBox.style.height = "100px";
  wrapper.appendChild(cropBox);
  let isResizing = false;
  cropBox.addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    let startX = ev.clientX;
    let startY = ev.clientY;
    let startW = cropBox.offsetWidth;
    let startH = cropBox.offsetHeight;
    function onMouseMove(e) {
      cropBox.style.width = startW + (e.clientX - startX) + "px";
      cropBox.style.height = startH + (e.clientY - startY) + "px";
    }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      applyCrop(img, cropBox);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}
function applyCrop(img, cropBox) {
  const rect = cropBox.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  const sx = rect.left - imgRect.left;
  const sy = rect.top - imgRect.top;
  const sw = rect.width;
  const sh = rect.height;
  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  const tmpImg = new Image();
  tmpImg.src = img.src;
  tmpImg.onload = () => {
    ctx.drawImage(tmpImg, sx, sy, sw, sh, 0, 0, sw, sh);
    img.src = canvas.toDataURL("image/png");
    cropBox.remove();
  };
}

// TABLE INSERT AT CURSOR 
document.getElementById("tableBtn").addEventListener("click", () => {
  showInputModal("Enter number of rows:", "2", (rowValue) => {
    if (rowValue === null) return;
    const rows = parseInt(rowValue);
    if (rows <= 0) return showToast("Rows must be greater than 0");
    showInputModal("Enter number of columns:", "2", (colValue) => {
      if (colValue === null) return;
      const cols = parseInt(colValue);
      if (cols <= 0) return showToast("Columns must be greater than 0");
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "70%";
      table.style.height = "250px";
      const editor = document.getElementById("editor");
      const editorBg = window.getComputedStyle(editor).backgroundColor;
      table.style.background = editorBg;
      table.style.tableLayout = "fixed";
      for (let r = 0; r < rows; r++) {
        const tr = document.createElement("tr");
        for (let c = 0; c < cols; c++) {
          const td = document.createElement("td");
          td.style.border = "1px solid black";
          td.style.padding = "5px";
          td.style.wordBreak = "break-word";
          td.innerHTML = "&nbsp;";
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(table);
        range.setStartAfter(table);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      table.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        const oldMenu = document.getElementById("table-context-menu");
        if (oldMenu) oldMenu.remove();
        const menu = document.createElement("div");
        menu.id = "table-context-menu";
        menu.style.position = "absolute";
        menu.style.left = ev.pageX + "px";
        menu.style.top = ev.pageY + "px";
        menu.style.background = "#ccc";
        menu.style.border = "1px solid #ccc";
        menu.style.padding = "5px";
        menu.style.zIndex = "2000";
        menu.style.fontFamily = "Arial, sans-serif";
        const makeOption = (text, handler) => {
          const opt = document.createElement("div");
          opt.textContent = text;
          opt.style.cursor = "pointer";
          opt.style.padding = "3px 5px";
          opt.onmouseenter = () => (opt.style.background = "#eee");
          opt.onmouseleave = () => (opt.style.background = "#fff");
          opt.onclick = () => {
            handler();
            menu.remove();
          };
          return opt;
        };
        menu.appendChild(makeOption("Add Row", () => {
          const tr = document.createElement("tr");
          for (let i = 0; i < table.rows[0].cells.length; i++) {
            const td = document.createElement("td");
            td.style.border = "1px solid black";
            td.style.padding = "5px";
            td.innerHTML = "&nbsp;";
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }));
        menu.appendChild(makeOption("Add Column", () => {
          for (let r = 0; r < table.rows.length; r++) {
            const td = document.createElement("td");
            td.style.border = "1px solid black";
            td.style.padding = "5px";
            td.innerHTML = "&nbsp;";
            table.rows[r].appendChild(td);
          }
        }));
        menu.appendChild(makeOption("Remove Row", () => {
          if (table.rows.length > 1) table.deleteRow(table.rows.length - 1);
        }));
        menu.appendChild(makeOption("Remove Column", () => {
          if (table.rows[0].cells.length > 1) {
            for (let r = 0; r < table.rows.length; r++) {
              table.rows[r].deleteCell(table.rows[r].cells.length - 1);
            }
          }
        }));
        menu.appendChild(makeOption("Delete Table", () => {
          table.remove();
        }));
        document.body.appendChild(menu);
        document.addEventListener("click", () => {
          const menuEl = document.getElementById("table-context-menu");
          if (menuEl) menuEl.remove();
        }, { once: true });
      });
    });
  });
});
document.getElementById("clearFormatBtn").addEventListener("click", () => {
  const html = editor.getHTML();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  function cleanNode(node) {
    if (node.nodeType === 1) { t
      node.removeAttribute("style");
      node.removeAttribute("class");
      Array.from(node.childNodes).forEach(cleanNode);
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
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the editor?")) {
    editor.reset();
  }
});
// Copy plain text
document.getElementById("copyTextBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(editor.getText())
    .then(() => showToast("Text copied to clipboard"))
    .catch(err => showToast("Failed to copy text"));
});
// Copy HTML
document.getElementById("copyHtmlBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(editor.getHTML())
    .then(() => showToast("HTML copied to clipboard"))
    .catch(err => showToast("Failed to copy HTML"));
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
  const defaultTitle = document.getElementById("docTitle").value || "Untitled";
  const author = document.getElementById("docAuthor").value || "Unknown";
  showInputModal("Enter file name for DOC:", defaultTitle, (fileName) => {
    if (!fileName) {
      showToast("DOC save cancelled");
      return;
    }
    const tempContent = content.replace(/<table/g, '<table style="width:100%; border-collapse: collapse;"')
                               .replace(/<img/g, '<img style="display:block; max-width:100%; height:auto; margin:0 auto;"');

    const wordHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <title>${fileName}</title>
        <xml>
          <w:WordDocument>
            <w:Author>${author}</w:Author>
            <w:Title>${fileName}</w:Title>
          </w:WordDocument>
        </xml>
      </head>
      <body>
        ${tempContent}
      </body>
      </html>
    `;
    const blob = new Blob([wordHeader], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName + ".doc";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("DOC file saved successfully");
  });
});
//save as pdf
document.getElementById("savePdfBtn").addEventListener("click", () => {
  const editorEl = document.getElementById("editor");
  const defaultTitle = document.getElementById("docTitle").value || "Untitled";
  const author = document.getElementById("docAuthor").value || "Unknown";
  showInputModal("Enter file name for PDF:", defaultTitle, (fileName) => {
    if (!fileName) {
      showToast("Operation cancelled");
      return;
    }
    const pdfContainer = document.createElement("div");
    pdfContainer.style.width = "794px"; // A4 approx 8.27in * 96dpi
    pdfContainer.style.minHeight = "1123px"; // A4 approx 11.69in * 96dpi
    pdfContainer.style.padding = "40px";
    pdfContainer.style.boxSizing = "border-box";
    pdfContainer.style.background = "#fff";
    pdfContainer.innerHTML = editorEl.innerHTML;
    const images = pdfContainer.querySelectorAll("img");
    images.forEach(img => {
      img.style.display = "block";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.margin = "0 auto";
    });
    const tables = pdfContainer.querySelectorAll("table");
    tables.forEach(table => {
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
    });
    const style = document.createElement("style");
    style.innerHTML = `
      table, img {
        page-break-inside: avoid !important;
      }
      table th, table td {
        border: 1px solid #000;
        padding: 4px;
      }
    `;
    pdfContainer.appendChild(style);
    html2pdf()
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: fileName + ".pdf",
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      })
      .from(pdfContainer)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        pdf.setProperties({
          title: fileName,
          author: author
        });
      })
      .save();
  });
});
let matches = [];
let currentMatch = -1;
let currentRange = null;
function clearHighlight() {
  const sel = window.getSelection();
  sel.removeAllRanges();
  currentRange = null;
}
function buildMatches(searchText) {
  matches = [];
  currentMatch = -1;
  if (!searchText) return;
  const walker = document.createTreeWalker(editor.editor, NodeFilter.SHOW_TEXT);
  const regex = new RegExp(searchText, "gi"); // partial matches
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
  if (matches.length === 0) return showToast("No matches found");
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
  if (!matches.length || searchText.toLowerCase() !== document.getElementById("findInput").dataset.lastSearch) {
    buildMatches(searchText);
    document.getElementById("findInput").dataset.lastSearch = searchText.toLowerCase();
  }
  highlightNext();
});
// Replace currently highlighted occurrence
document.getElementById("replaceBtn").addEventListener("click", () => {
  if (!currentRange) return showToast("No text selected to replace");
  const replaceText = document.getElementById("replaceInput").value;
  currentRange.deleteContents();
  currentRange.insertNode(document.createTextNode(replaceText));
  const searchText = document.getElementById("findInput").value;
  buildMatches(searchText);
  currentMatch = matches.findIndex(r => r.startContainer === currentRange.startContainer) - 1;
  clearHighlight();
});
// Replace All
document.getElementById("replaceAllBtn").addEventListener("click", () => {
  const searchText = document.getElementById("findInput").value;
  const replaceText = document.getElementById("replaceInput").value;
  if (!searchText) return;
  const walker = document.createTreeWalker(editor.editor, NodeFilter.SHOW_TEXT);
  const regex = new RegExp(searchText, "gi");
  let node;
  while (node = walker.nextNode()) {
    node.textContent = node.textContent.replace(regex, replaceText);
  }
  matches = [];
  currentMatch = -1;
  clearHighlight();
});
//theme
const toggleThemeBtn = document.getElementById("toggleThemeBtn");
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.getElementById("editor").classList.toggle("dark-mode");
  document.getElementById("ribbon").classList.toggle("dark-mode");
  document.querySelectorAll(".tabBtn, .group").forEach(el => el.classList.toggle("dark-mode"));
});
let autoSaveIntervalId = null;
const AUTO_SAVE_INTERVAL = 5000; 
const toggleAutoSaveBtn = document.getElementById("toggleAutoSaveBtn");
const autoSaveStatus = document.getElementById("autoSaveStatus");
function autoSave() {
  const content = editor.getHTML();
  const title = document.getElementById("docTitle")?.value || "";
  const author = document.getElementById("docAuthor")?.value || "";
  const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  const saveData = { content, title, author, theme };
  localStorage.setItem("miniWordPadData", JSON.stringify(saveData));
  const time = new Date().toLocaleTimeString();
  autoSaveStatus.textContent = `Auto-saved at ${time}`;
}
// Toggle Auto-save
toggleAutoSaveBtn.addEventListener("click", () => {
  if (autoSaveIntervalId) {
    clearInterval(autoSaveIntervalId);
    autoSaveIntervalId = null;
    toggleAutoSaveBtn.textContent = "Enable Auto-save";
    autoSaveStatus.textContent = "Auto-save: Off";
  } else {
    autoSave();
    autoSaveIntervalId = setInterval(autoSave, AUTO_SAVE_INTERVAL);
    toggleAutoSaveBtn.textContent = "Disable Auto-save";
    autoSaveStatus.textContent = "Auto-save: On";
  }
});
// Restore saved content on page load
window.addEventListener("load", () => {
  const savedData = localStorage.getItem("miniWordPadData");
  if (savedData) {
    const { content, title, author, theme } = JSON.parse(savedData);
    editor.editor.innerHTML = content || "";
    if (document.getElementById("docTitle")) document.getElementById("docTitle").value = title || "";
    if (document.getElementById("docAuthor")) document.getElementById("docAuthor").value = author || "";
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      document.getElementById("editor").classList.add("dark-mode");
      document.getElementById("ribbon").classList.add("dark-mode");
      document.querySelectorAll(".tabBtn, .group").forEach(el => el.classList.add("dark-mode"));
    }
  }
});
// Save editor content as HTML
document.getElementById("saveHtmlBtn").addEventListener("click", () => {
  const content = document.getElementById("editor").innerHTML;
  const defaultName = document.getElementById("docTitle").value || "Document";
  showInputModal("Enter file name for HTML:", defaultName, (fileName) => {
    if (!fileName) {
      showToast("HTML save cancelled");
      return;
    }
    // Prepare HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${fileName}</title>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName + ".html";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("HTML file saved successfully");
  });
});
// --- Undo / Redo stacks ---
const undoStack = [];
const redoStack = [];
const editorEl = document.getElementById("editor");
function saveState() {
  const currentState = editorEl.innerHTML;
  if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== currentState) {
    undoStack.push(currentState);
    if (undoStack.length > 100) undoStack.shift(); // optional limit
  }
}
function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
// Undo function
function undo() {
  if (undoStack.length > 1) {
    const lastState = undoStack.pop();
    redoStack.push(lastState);
    editorEl.innerHTML = undoStack[undoStack.length - 1];
    placeCaretAtEnd(editorEl);
  } else {
    showToast("Nothing to undo");
  }
}
// Redo function
function redo() {
  if (redoStack.length) {
    const state = redoStack.pop();
    undoStack.push(state);
    editorEl.innerHTML = state;
    placeCaretAtEnd(editorEl);
  } else {
    showToast("Nothing to redo");
  }
}
editorEl.addEventListener("input", () => {
  saveState();
  redoStack.length = 0; // clear redo after new input
});
document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);
saveState();
function showToast(message, duration = 2500) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.background = "#0078d7";
  toast.style.color = "#fff";
  toast.style.padding = "8px 12px";
  toast.style.borderRadius = "4px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s";
  container.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = "1");
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}
function showInputModal(message, defaultValue = "", callback) {
  const modal = document.getElementById("inputModal");
  const input = document.getElementById("modalInput");
  document.getElementById("modalMessage").textContent = message;
  input.value = defaultValue;
  modal.style.display = "flex";
  const cleanUp = () => {
    modal.style.display = "none";
    document.getElementById("modalOk").removeEventListener("click", okHandler);
    document.getElementById("modalCancel").removeEventListener("click", cancelHandler);
  };
  const okHandler = () => { cleanUp(); callback(input.value); };
  const cancelHandler = () => { cleanUp(); callback(null); };
  document.getElementById("modalOk").addEventListener("click", okHandler);
  document.getElementById("modalCancel").addEventListener("click", cancelHandler);
}



