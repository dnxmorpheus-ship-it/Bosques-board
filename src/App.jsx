import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

const UPLOAD_PASSWORD = "board2026";
const CLOUD_NAME = "inprxaf1";
const UPLOAD_PRESET = "ml_default";

const firebaseConfig = {
  apiKey: "AIzaSyD3UVYfH1vEAW-NNcrLp127jdZExAoIv3w",
  authDomain: "bosques-board.firebaseapp.com",
  projectId: "bosques-board",
  storageBucket: "bosques-board.firebasestorage.app",
  messagingSenderId: "703454918034",
  appId: "1:703454918034:web:6c360b3c5eed1017ed3d4b",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const postsCol = collection(db, "posts");

const CATEGORIES = [
  "Presidentes y Lectores",
  "Conferencias",
  "Acomodadores y Micrófonos",
  "Vida y Ministerio",
  "Limpieza",
  "Anuncios Generales",
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #faf8f5;
    --bg2: #f2ede6;
    --border: #ddd8d0;
    --text: #1a1814;
    --text2: #6b6560;
    --accent: #2d5a3d;
    --accent-light: #eaf2ec;
    --accent-hover: #234a30;
    --danger: #c0392b;
    --white: #ffffff;
    --shadow: 0 2px 12px rgba(0,0,0,0.08);
    --radius: 10px;
    --font-display: 'Lora', Georgia, serif;
    --font-body: 'Inter', system-ui, sans-serif;
  }

  body {
    background:
      linear-gradient(rgba(250,248,245,0.9), rgba(250,248,245,0.9)),
      url('https://res.cloudinary.com/inprxaf1/image/upload/v1784610732/bosques_board_background.jpg') center/cover fixed no-repeat;
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }

  .root { min-height: 100vh; display: flex; flex-direction: column; }

  .topbar {
    background: var(--accent);
    color: white;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .topbar-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    line-height: 1.2;
  }

  .topbar-title small {
    display: block;
    font-family: var(--font-body);
    font-size: 0.66rem;
    font-weight: 400;
    opacity: 0.7;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .post-btn-top {
    background: white;
    color: var(--accent);
    border: none;
    padding: 7px 18px;
    border-radius: 100px;
    font-family: var(--font-body);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .post-btn-top:hover { opacity: 0.85; }

  .drawer {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    padding: 24px;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .drawer-inner { max-width: 520px; display: flex; flex-direction: column; gap: 16px; }

  .field { display: flex; flex-direction: column; gap: 6px; }

  .field label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text2);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .field input[type="password"],
  .field input[type="text"],
  .field select {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: var(--font-body);
    font-size: 0.92rem;
    padding: 9px 12px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
    appearance: none;
    -webkit-appearance: none;
  }

  .field input:focus,
  .field select:focus { border-color: var(--accent); }

  .pw-row { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }

  .verify-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 9px 20px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .verify-btn:hover { background: var(--accent-hover); }

  .drop-zone {
    border: 1.5px dashed var(--border);
    border-radius: var(--radius);
    padding: 28px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    color: var(--text2);
    font-size: 0.88rem;
    background: var(--bg);
  }
  .drop-zone.over {
    border-color: var(--accent);
    background: var(--accent-light);
    color: var(--accent);
  }
  .drop-zone input[type="file"] { display: none; }
  .drop-icon { font-size: 1.8rem; margin-bottom: 8px; }
  .drop-hint { font-size: 0.75rem; color: var(--text2); margin-top: 4px; opacity: 0.7; }

  .preview-thumb {
    max-height: 120px;
    max-width: 100%;
    border-radius: 6px;
    object-fit: contain;
  }

  .pdf-preview-label {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--accent-light);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 500;
  }

  .submit-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    width: fit-content;
    transition: background 0.15s;
  }
  .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .submit-btn:not(:disabled):hover { background: var(--accent-hover); }

  .progress-bar-wrap {
    width: 100%;
    height: 6px;
    background: var(--bg2);
    border-radius: 100px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: var(--accent);
    border-radius: 100px;
    transition: width 0.2s ease;
  }

  .msg-error { color: var(--danger); font-size: 0.83rem; }
  .msg-ok    { color: var(--accent); font-size: 0.83rem; }

  .main { flex: 1; padding: 32px 24px; max-width: 900px; margin: 0 auto; width: 100%; }

  .tabs-wrap {
    margin-bottom: 28px;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: 2px;
  }

  .tab {
    background: none;
    border: 1.5px solid var(--border);
    color: var(--text2);
    border-radius: 100px;
    padding: 7px 16px;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }
  .tab:hover { border-color: var(--accent); color: var(--accent); }
  .tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--accent-light);
  }

  .doc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .doc-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: box-shadow 0.15s, transform 0.15s;
    position: relative;
  }
  .doc-card:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }

  .doc-thumb {
    width: 100%;
    aspect-ratio: 3/4;
    object-fit: contain;
    display: block;
    background: var(--bg2);
  }

  .doc-pdf-thumb {
    width: 100%;
    aspect-ratio: 3/4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--accent-light);
    gap: 8px;
    color: var(--accent);
  }

  .doc-pdf-thumb .pdf-icon { font-size: 2.5rem; }
  .doc-pdf-thumb .pdf-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 0.7;
  }

  .doc-meta {
    padding: 10px 12px;
    border-top: 1px solid var(--border);
  }

  .doc-caption {
    font-size: 0.82rem;
    color: var(--text);
    font-weight: 500;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-date {
    font-size: 0.7rem;
    color: var(--text2);
    margin-top: 3px;
  }

  .delete-overlay {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(192,57,43,0.92);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 9px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .doc-card:hover .delete-overlay { opacity: 1; }

  .empty-state {
    text-align: center;
    padding: 48px 20px;
    color: var(--text2);
    font-size: 0.88rem;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius);
  }
  .empty-icon { font-size: 2rem; margin-bottom: 10px; opacity: 0.5; }

  /* Viewer */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,10,8,0.93);
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeIn 0.15s ease;
    overflow: hidden;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-bar {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(0,0,0,0.5);
    flex-shrink: 0;
    gap: 12px;
  }

  .modal-caption {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.8);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .modal-controls {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-shrink: 0;
  }

  .ctrl-btn {
    background: rgba(255,255,255,0.12);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    font-family: var(--font-body);
    white-space: nowrap;
  }
  .ctrl-btn:hover { background: rgba(255,255,255,0.22); }
  .ctrl-btn.red { color: #ff8080; }

  .img-viewer-wrap {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 20px;
    width: 100%;
    cursor: grab;
  }
  .img-viewer-wrap:active { cursor: grabbing; }

  .img-viewer {
    display: block;
    max-width: 100%;
    border-radius: 6px;
    transform-origin: top center;
    transition: transform 0.2s ease;
    user-select: none;
    -webkit-user-drag: none;
  }

  .pdf-frame-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .pdf-frame {
    flex: 1;
    width: 100%;
    border: none;
    background: white;
  }

  .pdf-mobile-fallback {
    display: none;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: white;
    text-align: center;
    padding: 40px 24px;
  }
  .pdf-mobile-fallback p { font-size: 0.9rem; opacity: 0.75; }

  .open-pdf-btn {
    background: white;
    color: var(--accent);
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }

  @media (max-width: 640px) {
    .pdf-frame { display: none; }
    .pdf-mobile-fallback { display: flex; }
    .topbar-title { font-size: 0.92rem; }
    .main { padding: 20px 16px; }
    .doc-grid { grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 12px; }
    .tabs-wrap {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .tabs-wrap::-webkit-scrollbar { display: none; }
    .tabs {
      flex-wrap: nowrap;
      min-width: max-content;
    }
  }

  .zoom-hint {
    font-size: 0.68rem;
    color: rgba(255,255,255,0.4);
    margin-top: 1px;
  }
`;

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("es-SV", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Cloudinary upload ────────────────────────────────
async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const resourceType = file.type === "application/pdf" ? "raw" : "image";
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error("Error al subir archivo."));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red."));
    xhr.send(formData);
  });
}

// Uploads the PDF a second time through the image pipeline so Cloudinary can
// render a first-page thumbnail. Best-effort: the grid falls back to the
// generic PDF icon if this fails or the account can't deliver PDF-as-image.
async function uploadPdfThumbSource(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("thumb upload failed");
  const data = await res.json();
  return data.secure_url
    .replace("/upload/", "/upload/pg_1,f_jpg,q_auto,w_500/")
    .replace(/\.pdf$/i, ".jpg");
}

// ── PDF grid thumbnail (falls back to icon on load failure) ─────────
function PdfThumb({ thumb }) {
  const [failed, setFailed] = useState(false);
  if (!thumb || failed) {
    return (
      <div className="doc-pdf-thumb">
        <span className="pdf-icon">📄</span>
        <span className="pdf-label">PDF</span>
      </div>
    );
  }
  return (
    <img
      className="doc-thumb"
      src={thumb}
      alt="PDF"
      onError={() => setFailed(true)}
    />
  );
}

// ── Viewer ───────────────────────────────────────────
function Viewer({ doc, onClose, isAdmin, onDelete }) {
  const [zoom, setZoom] = useState(1);
  const isPdf = doc.type === "pdf";

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-bar" onClick={e => e.stopPropagation()}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="modal-caption">{doc.caption || doc.category}</div>
          {!isPdf && <div className="zoom-hint">{Math.round(zoom * 100)}% · pellizca o usa los botones</div>}
        </div>
        <div className="modal-controls">
          {!isPdf && <>
            <button className="ctrl-btn" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}>−</button>
            <button className="ctrl-btn" onClick={() => setZoom(1)}>Reset</button>
            <button className="ctrl-btn" onClick={() => setZoom(z => Math.min(z + 0.25, 4))}>+</button>
          </>}
          {isAdmin && (
            <button className="ctrl-btn red" onClick={() => { onDelete(doc.id); onClose(); }}>
              Eliminar
            </button>
          )}
          <button className="ctrl-btn red" onClick={onClose}>✕</button>
        </div>
      </div>

      {isPdf ? (
        <div className="pdf-frame-wrap" onClick={e => e.stopPropagation()}>
          <iframe
            className="pdf-frame"
            src={doc.src}
            title={doc.caption || "Documento"}
          />
          <div className="pdf-mobile-fallback">
            <p>Los PDFs no se pueden mostrar directamente en móviles.</p>
            <a href={doc.src} target="_blank" rel="noreferrer" className="open-pdf-btn">
              Abrir PDF
            </a>
          </div>
        </div>
      ) : (
        <div className="img-viewer-wrap" onClick={e => e.stopPropagation()}>
          <img
            className="img-viewer"
            src={doc.src}
            alt={doc.caption || "Anuncio"}
            style={{ transform: `scale(${zoom})` }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

// ── App ──────────────────────────────────────────────
export default function App() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [pw, setPw]                 = useState("");
  const [pwError, setPwError]       = useState("");
  const [activeTab, setActiveTab]   = useState(CATEGORIES[0]);
  const [posts, setPosts]           = useState([]);
  const [viewing, setViewing]       = useState(null);

  const [category, setCategory]     = useState(CATEGORIES[0]);
  const [caption, setCaption]       = useState("");
  const [file, setFile]             = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType]     = useState(null);
  const [dragover, setDragover]     = useState(false);
  const [posting, setPosting]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [statusMsg, setStatusMsg]   = useState("");
  const fileRef                     = useRef();

  useEffect(() => {
    const q = query(postsCol, orderBy("date", "desc"));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  function verify() {
    if (pw === UPLOAD_PASSWORD) { setIsAdmin(true); setPwError(""); }
    else setPwError("Contraseña incorrecta.");
  }

  function handleFile(f) {
    if (!f) return;
    const isImg = f.type.startsWith("image/");
    const isPdf = f.type === "application/pdf";
    if (!isImg && !isPdf) { setStatusMsg("Solo se aceptan imágenes o PDFs."); return; }
    setStatusMsg("");
    setFile(f);
    setFileType(isPdf ? "pdf" : "image");
    if (isImg) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setFilePreview("pdf");
    }
  }

  async function handlePost() {
    if (!file) return;
    setPosting(true);
    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, setProgress);
      let thumb = null;
      if (fileType === "pdf") {
        try { thumb = await uploadPdfThumbSource(file); } catch { /* fall back to icon */ }
      }
      await addDoc(postsCol, {
        src: url,
        type: fileType,
        category,
        caption: caption.trim(),
        date: Date.now(),
        ...(thumb ? { thumb } : {}),
      });
      setFile(null); setFilePreview(null); setFileType(null); setCaption("");
      setStatusMsg("Publicado correctamente.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      setStatusMsg(err.message || "Error al publicar.");
    }
    setPosting(false);
    setProgress(0);
  }

  function handleDelete(id) {
    const pw = window.prompt("Ingresa la contraseña de colaborador para eliminar este anuncio:");
    if (pw === null) return;
    if (pw !== UPLOAD_PASSWORD) { window.alert("Contraseña incorrecta."); return; }
    deleteDoc(doc(db, "posts", id)).catch(() => {});
  }

  const filtered = posts.filter(p => p.category === activeTab);

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">

        <header className="topbar">
          <div className="topbar-title">
            <small>Tablero de anuncios</small>
            Congregación Bosques de la Escalón
          </div>
          <button className="post-btn-top" onClick={() => setShowDrawer(v => !v)}>
            {showDrawer ? "Cerrar" : "Publicar"}
          </button>
        </header>

        {showDrawer && (
          <div className="drawer">
            <div className="drawer-inner">
              {!isAdmin ? (
                <div className="field">
                  <label>Contraseña de colaborador</label>
                  <div className="pw-row">
                    <input
                      type="password"
                      placeholder="Ingresa la contraseña"
                      value={pw}
                      onChange={e => setPw(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && verify()}
                      style={{ maxWidth: 260 }}
                    />
                    <button className="verify-btn" onClick={verify}>Verificar</button>
                  </div>
                  {pwError && <span className="msg-error">{pwError}</span>}
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>Categoría</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="field">
                    <label>Archivo (imagen o PDF)</label>
                    <div
                      className={`drop-zone ${dragover ? "over" : ""}`}
                      onDragOver={e => { e.preventDefault(); setDragover(true); }}
                      onDragLeave={() => setDragover(false)}
                      onDrop={e => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => fileRef.current.click()}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={e => handleFile(e.target.files[0])}
                      />
                      {!filePreview && <>
                        <div className="drop-icon">📎</div>
                        <div>Arrastra un archivo aquí o toca para buscar</div>
                        <div className="drop-hint">Imágenes JPG/PNG o PDF</div>
                      </>}
                      {filePreview === "pdf" && (
                        <div className="pdf-preview-label">
                          <span>📄</span><span>{file?.name}</span>
                        </div>
                      )}
                      {filePreview && filePreview !== "pdf" && (
                        <img className="preview-thumb" src={filePreview} alt="preview" />
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label>Descripción (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. Semana del 10 al 16 de julio"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  {posting && (
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                  )}

                  <button className="submit-btn" onClick={handlePost} disabled={!file || posting}>
                    {posting ? `Subiendo… ${progress}%` : "Publicar anuncio"}
                  </button>

                  {statusMsg && (
                    <span className={statusMsg.startsWith("Publicado") ? "msg-ok" : "msg-error"}>
                      {statusMsg}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <main className="main">
          <div className="tabs-wrap">
            <div className="tabs">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`tab ${activeTab === c ? "active" : ""}`}
                  onClick={() => setActiveTab(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <h2 className="section-title">{activeTab}</h2>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div>No hay anuncios en esta categoría todavía.</div>
            </div>
          ) : (
            <div className="doc-grid">
              {filtered.map(doc => (
                <div className="doc-card" key={doc.id} onClick={() => setViewing(doc)}>
                  {doc.type === "image"
                    ? <img className="doc-thumb" src={doc.src} alt={doc.caption || doc.category} />
                    : <PdfThumb thumb={doc.thumb} />
                  }
                  <div className="doc-meta">
                    {doc.caption && <div className="doc-caption">{doc.caption}</div>}
                    <div className="doc-date">{formatDate(doc.date)}</div>
                  </div>
                  {isAdmin && (
                    <button
                      className="delete-overlay"
                      onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {viewing && (
          <Viewer
            doc={viewing}
            onClose={() => setViewing(null)}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />
        )}
      </div>
    </>
  );
}
