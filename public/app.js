const API = "http://localhost:5000/api";
let token = localStorage.getItem("ers_token") || "";
let subjects = [];
let editingRoll = "";
const $ = id => document.getElementById(id);
const val = id => $(id) ? $(id).value.trim() : "";
function setBtn(id, loading, text) { const btn = $(id); if (!btn) return; btn.disabled = loading; btn.innerHTML = loading ? '<span class="spinner"></span> Please wait...' : text; }
async function api(method, path, body) {
    const opts = { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}
let toastTmr;
function toast(msg, type = "success") { $("toastText").textContent = msg; $("toastDot").className = "toast-dot " + type; $("toast").style.display = "flex"; clearTimeout(toastTmr); toastTmr = setTimeout(() => $("toast").style.display = "none", 3200); }
function showPage(id, btn) { document.querySelectorAll(".page").forEach(p => p.classList.remove("active")); document.querySelectorAll(".nav-pill").forEach(b => b.classList.remove("active")); $(id).classList.add("active"); if (btn) btn.classList.add("active"); if (id === "home") loadStats(); }
async function loadStats() { try { const d = await api("GET", "/results/stats"); const s = d.data; $("s1").textContent = s.totalStudents; $("s2").textContent = s.totalResults; $("s3").textContent = s.passRate + "%"; $("s4").textContent = s.avgPercentage + "%"; } catch { ["s1", "s2", "s3", "s4"].forEach(i => $(i).textContent = "—"); } }
async function checkHealth() { try { await fetch(API + "/health"); $("apiBar").className = "api-bar"; $("apiMsg").textContent = "Server connected — http://localhost:5000"; } catch { $("apiBar").className = "api-bar offline"; $("apiMsg").textContent = "Server offline — run: yarn start"; } }
async function doLogin() {
    const u = val("aUser"), p = $("aPass").value;
    if (!u || !p) { toast("Enter username and password!", "warn"); return; }
    setBtn("loginBtn", true, "Sign In");
    try {
        const data = await api("POST", "/auth/login", { username: u, password: p });
        token = data.token; localStorage.setItem("ers_token", token);
        $("adminLock").style.display = "none"; $("adminPanel").style.display = "block";
        checkHealth(); loadStats(); await loadSubjects();
        toast("Welcome, Admin!");
    } catch (e) { toast(e.message || "Invalid credentials!", "error"); $("aPass").style.borderColor = "var(--rose)"; setTimeout(() => $("aPass").style.borderColor = "", 2000); }
    finally { setBtn("loginBtn", false, "Sign In"); }
}
function doLogout() { token = ""; localStorage.removeItem("ers_token"); $("adminLock").style.display = "block"; $("adminPanel").style.display = "none"; $("aUser").value = $("aPass").value = ""; toast("Logged out.", "warn"); }
async function tryAutoLogin() { if (!token) return; try { await api("GET", "/results/stats"); $("adminLock").style.display = "none"; $("adminPanel").style.display = "block"; checkHealth(); loadStats(); await loadSubjects(); } catch { token = ""; localStorage.removeItem("ers_token"); } }
const tabs = { addStu: ["tabAddStu", "tb1"], addMrk: ["tabAddMrk", "tb2"], manSub: ["tabManSub", "tb3"], allStu: ["tabAllStu", "tb4"], allRes: ["tabAllRes", "tb5"] };
function switchTab(key) { Object.values(tabs).forEach(([el]) => $(el).style.display = "none"); document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active")); const [el, btn] = tabs[key]; $(el).style.display = "block"; $(btn).classList.add("active"); if (key === "allStu") loadStudents(); if (key === "allRes") loadResults(); if (key === "manSub") renderSubjectTable(); if (key === "addMrk") renderMarksInputs("marksInputGrid"); }
async function loadSubjects() { try { const d = await api("GET", "/subjects"); subjects = d.data || []; renderSubjectTable(); renderMarksInputs("marksInputGrid"); } catch { subjects = []; } }
function renderSubjectTable() { const body = $("subBody"), emp = $("emptySub"); if (!subjects.length) { body.innerHTML = ""; emp.style.display = "block"; return; } emp.style.display = "none"; body.innerHTML = subjects.map((s, i) => `<tr><td style="color:var(--muted)">${i + 1}</td><td><strong>${s.name}</strong></td><td>${s.maxMarks}</td><td><button class="btn btn-danger btn-sm" onclick="delSubject('${s._id}','${s.name}')">Delete</button></td></tr>`).join(""); }
function mkId(prefix, name) { return "mk_" + prefix + "_" + name.replace(/\s/g, "_"); }
function renderMarksInputs(containerId, existingMarks = []) { const grid = $(containerId); if (!grid) return; if (!subjects.length) { grid.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">No subjects. Add subjects in Subjects tab first.</p>'; return; } grid.innerHTML = subjects.map(s => { const ex = existingMarks.find(m => m.sub === s.name); return `<div class="mark-input-box"><div class="mark-sub-label">${s.name}</div><input type="number" id="${mkId(containerId, s.name)}" placeholder="0" min="0" max="${s.maxMarks}" value="${ex ? ex.val : ""}"/><div class="mark-max-hint">out of ${s.maxMarks}</div></div>`; }).join(""); }
async function addSubject() { const name = val("subName"), max = parseInt($("subMax").value) || 100; if (!name) { toast("Subject name required!", "warn"); return; } setBtn("addSubBtn", true, "Add Subject"); try { await api("POST", "/subjects", { name, maxMarks: max }); $("subName").value = ""; $("subMax").value = "100"; await loadSubjects(); toast(name + " added!"); } catch (e) { toast(e.message, "error"); } finally { setBtn("addSubBtn", false, "Add Subject"); } }
async function delSubject(id, name) { if (!confirm("Delete subject " + name + "?")) return; try { await api("DELETE", "/subjects/" + id); await loadSubjects(); toast(name + " deleted", "warn"); } catch (e) { toast(e.message, "error"); } }
async function addStudent() { const rollNo = val("nRoll"), name = val("nName"), course = val("nClass"); if (!rollNo || !name || !course) { toast("Fill all required fields!", "warn"); return; } setBtn("addStuBtn", true, "Add Student"); try { await api("POST", "/students", { rollNo, name, course, semester: $("nSem").value, gender: $("nGen").value, email: val("nEmail") });["nRoll", "nName", "nClass", "nEmail"].forEach(id => $(id).value = ""); toast(name + " registered!"); loadStats(); } catch (e) { toast(e.message, "error"); } finally { setBtn("addStuBtn", false, "Add Student"); } }
async function saveMarks() { const rollNo = val("mRoll"); if (!rollNo) { toast("Enter Roll Number!", "warn"); return; } if (!subjects.length) { toast("No subjects found! Add subjects first.", "warn"); return; } const subs = subjects.map(s => ({ sub: s.name, val: parseInt($(mkId("marksInputGrid", s.name)).value) || 0, maxMarks: s.maxMarks })); setBtn("saveMrkBtn", true, "Save Marks"); try { await api("POST", "/results", { rollNo, year: val("mYear"), subs }); subjects.forEach(s => { const el = $(mkId("marksInputGrid", s.name)); if (el) el.value = ""; }); $("mRoll").value = ""; toast("Marks saved! Grade auto-calculated"); loadStats(); } catch (e) { toast(e.message, "error"); } finally { setBtn("saveMrkBtn", false, "Save Marks"); } }
async function loadStudents(search = "") {
    const body = $("stuBody"), emp = $("emptyStu2");
    body.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted)"><span class="spinner"></span></td></tr>';
    emp.style.display = "none";
    try {
        const d = await api("GET", "/students" + (search ? "?search=" + encodeURIComponent(search) : ""));
        if (!d.data.length) { body.innerHTML = ""; emp.style.display = "block"; return; }
        body.innerHTML = d.data.map(s => `
      <tr>
        <td><span class="roll-pill">${s.rollNo}</span></td>
        <td><strong>${s.name}</strong></td>
        <td>${s.course}</td>
        <td>${s.semester}</td>
        <td>${s.gender}</td>
        <td style="color:var(--muted)">${s.email || "—"}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-warning btn-sm" onclick="openStuEditModal('${s.rollNo}','${s.name}','${s.course}','${s.semester}','${s.gender}','${s.email || ''}')">&#9998; Edit</button>
            <button class="btn btn-danger btn-sm" onclick="delStudent('${s.rollNo}')">&#128465; Delete</button>
          </div>
        </td>
      </tr>`).join("");
    } catch (e) { body.innerHTML = ""; toast(e.message, "error"); }
}
async function loadResults(search = "") { const body = $("resBody"), emp = $("emptyRes"); body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><span class="spinner"></span></td></tr>'; emp.style.display = "none"; try { const d = await api("GET", "/results" + (search ? "?search=" + encodeURIComponent(search) : "")); if (!d.data.length) { body.innerHTML = ""; emp.style.display = "block"; return; } const gCls = { O: "badge-o", "A+": "badge-aplus", A: "badge-a", B: "badge-b", C: "badge-c", F: "badge-fail" }; body.innerHTML = d.data.map(r => `<tr><td><span class="roll-pill">${r.rollNo}</span></td><td><strong>${r.studentName}</strong></td><td>${r.total}/${r.maxTotal || 500}</td><td><strong>${r.percentage}%</strong></td><td><span class="badge ${gCls[r.grade] || "badge-fail"}">${r.grade}</span></td><td><span class="badge ${r.status === "Pass" ? "badge-pass" : "badge-fail"}">${r.status === "Pass" ? "Pass" : "Fail"}</span></td><td style="display:flex;gap:6px;"><button class="btn btn-warning btn-sm" onclick="openEditModal('${r.rollNo}')">Edit</button><button class="btn btn-danger btn-sm" onclick="delResult('${r.rollNo}')">Delete</button></td></tr>`).join(""); } catch (e) { body.innerHTML = ""; toast(e.message, "error"); } }
async function delStudent(rollNo) { if (!confirm("Delete this student?")) return; try { await api("DELETE", "/students/" + rollNo); toast("Deleted", "warn"); loadStudents(); loadStats(); } catch (e) { toast(e.message, "error"); } }
async function delResult(rollNo) { if (!confirm("Delete this result?")) return; try { await api("DELETE", "/results/" + rollNo); toast("Deleted", "warn"); loadResults(); loadStats(); } catch (e) { toast(e.message, "error"); } }
async function openEditModal(rollNo) { editingRoll = rollNo; $("editRollLabel").textContent = rollNo; try { const d = await api("GET", "/results/" + rollNo); const r = d.data; $("editYear").value = r.year || "2025"; renderMarksInputs("editMarksGrid", r.subs || []); $("editModal").style.display = "flex"; } catch (e) { toast(e.message, "error"); } }
function closeEditModal() { $("editModal").style.display = "none"; editingRoll = ""; }
async function saveEdit() { if (!editingRoll) return; if (!subjects.length) { toast("No subjects loaded!", "warn"); return; } const subs = subjects.map(s => ({ sub: s.name, val: parseInt($(mkId("editMarksGrid", s.name)).value) || 0, maxMarks: s.maxMarks })); setBtn("saveEditBtn", true, "Save Changes"); try { await api("PUT", "/results/" + editingRoll, { year: val("editYear"), subs }); toast("Result updated!"); closeEditModal(); loadResults(); loadStats(); } catch (e) { toast(e.message, "error"); } finally { setBtn("saveEditBtn", false, "Save Changes"); } }
async function checkResult() { const roll = val("cRoll"), area = $("resultArea"); if (!roll) { toast("Enter a Roll Number!", "warn"); return; } setBtn("checkBtn", true, "Search Result"); area.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted)"><span class="spinner" style="width:32px;height:32px;border-width:3px"></span></div>'; try { const d = await api("GET", "/results/" + roll); const r = d.data; const pct = r.percentage; const gCls = { O: "badge-o", "A+": "badge-aplus", A: "badge-a", B: "badge-b", C: "badge-c", F: "badge-fail" }; const subjHTML = (r.subs || []).map(m => `<div class="subject-tile"><div class="sub-name">${m.sub}</div><div class="sub-marks" style="color:${m.val < 40 ? "var(--rose)" : m.val >= (m.maxMarks * 0.75) ? "var(--emerald)" : "var(--text)"}">${m.val}</div><div class="sub-total">/ ${m.maxMarks || 100}</div><div class="sub-bar"><div class="sub-bar-fill" style="width:${m.val / (m.maxMarks || 100) * 100}%"></div></div></div>`).join(""); area.innerHTML = `<div class="result-card" style="margin-top:1.5rem;"><div class="result-top"><div class="result-name-block"><div class="name">${r.studentName}</div><div class="meta">${r.course} &middot; ${r.semester} &middot; Exam: ${r.year}</div></div><div style="text-align:center"><div class="grade-circle">${r.grade}</div><span class="badge ${r.status === "Pass" ? "badge-pass" : "badge-fail"}">${r.status === "Pass" ? "PASS" : "FAIL"}</span></div></div><div class="subject-grid">${subjHTML}</div><div class="summary-row"><div class="summary-tile"><div class="s-label">Total Marks</div><div class="s-val">${r.total}<span style="font-size:.9rem;color:var(--muted);-webkit-text-fill-color:var(--muted)">/${r.maxTotal || 500}</span></div></div><div class="summary-tile"><div class="s-label">Percentage</div><div class="s-val">${pct}%</div></div><div class="summary-tile"><div class="s-label">Grade</div><div class="s-val">${r.grade}</div></div><div class="summary-tile"><div class="s-label">Result</div><div class="s-val" style="background:${r.status === "Pass" ? "var(--grad3)" : "linear-gradient(135deg,var(--rose),#fb7185)"};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${r.status}</div></div></div><div class="perf-label"><span>Overall Performance</span><span>${pct}%</span></div><div class="perf-track"><div class="perf-fill" id="pf" style="width:0%"></div></div></div>`; setTimeout(() => { const f = $("pf"); if (f) f.style.width = pct + "%"; }, 80); } catch { area.innerHTML = `<div class="glass" style="padding:3rem;text-align:center;margin-top:1rem;"><span style="font-size:3rem;display:block;margin-bottom:1rem;opacity:.5">&#128269;</span><p style="color:var(--muted)">No result found for Roll No: <strong style="color:var(--text)">${roll}</strong></p></div>`; } finally { setBtn("checkBtn", false, "Search Result"); } }
$("editModal").addEventListener("click", e => { if (e.target === $("editModal")) closeEditModal(); });
loadStats(); tryAutoLogin();

// ── STUDENT CRUD ──
let editingStuRoll = "";

function openStuEditModal(rollNo, name, course, semester, gender, email) {
    editingStuRoll = rollNo;
    $("seRoll").value = rollNo;
    $("seName").value = name;
    $("seCourse").value = course;
    $("seEmail").value = email || "";
    // Semester dropdown
    const semSel = $("seSem");
    for (let i = 0; i < semSel.options.length; i++) {
        if (semSel.options[i].text === semester || semSel.options[i].value === semester) { semSel.selectedIndex = i; break; }
    }
    // Gender dropdown
    const genSel = $("seGen");
    for (let i = 0; i < genSel.options.length; i++) {
        if (genSel.options[i].text === gender || genSel.options[i].value === gender) { genSel.selectedIndex = i; break; }
    }
    $("stuEditModal").style.display = "flex";
}

function closeStuEditModal() {
    $("stuEditModal").style.display = "none";
    editingStuRoll = "";
}

async function saveStuEdit() {
    if (!editingStuRoll) { toast("No student selected!", "warn"); return; }
    const name = val("seName"), course = val("seCourse");
    if (!name) { toast("Name required!", "warn"); return; }
    if (!course) { toast("Course required!", "warn"); return; }
    setBtn("saveStuEditBtn", true, "Save Changes");
    try {
        const updated = await api("PUT", "/students/" + editingStuRoll, {
            name,
            course,
            semester: $("seSem").value,
            gender: $("seGen").value,
            email: val("seEmail")
        });
        toast("Student updated successfully! ✅");
        closeStuEditModal();
        loadStudents();
        loadStats();
    } catch (e) {
        toast(e.message || "Update failed!", "error");
    } finally {
        setBtn("saveStuEditBtn", false, "Save Changes");
    }
}

async function delStudent(rollNo) {
    if (!confirm("Delete student Roll No: " + rollNo + "?\nThis cannot be undone!")) return;
    try {
        await api("DELETE", "/students/" + rollNo);
        toast("Student deleted", "warn");
        loadStudents();
        loadStats();
    } catch (e) { toast(e.message, "error"); }
}

$("stuEditModal").addEventListener("click", e => { if (e.target === $("stuEditModal")) closeStuEditModal(); });
