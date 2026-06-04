const classListContainer = document.getElementById("classListContainer")
const newClassName = document.getElementById("newClassName")
const addClassBtn = document.getElementById("addClassBtn")
const classSelect = document.getElementById("studentClassId")
const filterClass = document.getElementById("filterClass")
const studentId = document.getElementById("studentId")
const studentName = document.getElementById("studentName")
const studentAge = document.getElementById("studentAge")
const studentMarks = document.getElementById("studentMarks")
const studentPresent = document.getElementById("studentPresent")
const addStudentBtn = document.getElementById("addStudentBtn")
const updateStudentBtn = document.getElementById("updateStudentBtn")
const studentListContainer = document.getElementById("studentListContainer")
const deleteStudentBtn = document.getElementById("deleteStudentBtn")
const filterName = document.getElementById("filterName")
const filterMarksMin = document.getElementById("filterMarksMin")
const filterPresentMin = document.getElementById("filterPresentMin")
const applyFilterBtn = document.getElementById("applyFilterBtn")

// const api = "http://localhost:5000"
const api = "https://student-manager-s0ou.onrender.com"

let statTotal = document.getElementById("statTotal")
let statClasses = document.getElementById("statClasses")
let statAvgMarks = document.getElementById("statAvgMarks")
let statPresentAvg = document.getElementById("statPresentAvg")
let statTotalPresent = document.getElementById("statTotalPresent")
let editingStudentId = null
let classes = []


const showStats = async () => {
    const res = await fetch(api + "/stats")
    const stats = await res.json()
    statTotal.innerText = stats.total_students
    statClasses.innerText = stats.total_classes
    statAvgMarks.innerText = stats.avg_marks.toFixed(2)
    statPresentAvg.innerText = stats.avg_present.toFixed(2)
    statTotalPresent.innerText = stats.total_present
}


// ================Shared student renderer=================
const renderStudents = (students, emptyMessage = "No students found") => {
    studentListContainer.innerHTML = ""

    if (students.length === 0) {
        studentListContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-blue-300/50">
            <div class="text-4xl mb-3">🎓</div>
            <div class="text-lg font-semibold">${emptyMessage}</div>
        </div>`
        return
    }

    students.forEach(s => {
        const list = document.createElement("div")
        list.innerHTML = `
        <div class="student-card cursor-pointer" data-student-id="${s.id}">
              <div class="flex items-center gap-3 w-3/12">
                <span class="avatar-placeholder text-sm">${s.name.charAt(0)}</span>
                <div>
                  <div class="font-semibold text-white text-sm">${s.name}</div>
                  <div class="flex text-xs text-blue-300/70 gap-2 mt-0.5">
                    <span>ID ${s.id}</span>
                    <span>●</span>
                    <span>${s.age} y</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4 w-5/12 justify-start">
                <span class="class-badge">${getClassName(s.class_id)}</span>
                <span class="mark-pill">📊 ${s.marks}%</span>
                <span class="attendance-icon ${s.present > 20 ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-amber-900/30 text-amber-300'}">📅 ${s.present}</span>
              </div>
              <div class="flex items-center gap-1">
                <button class="action-btn edit-student" data-student-id="${s.id}">✎ edit</button>
                <button class="action-btn delete-student" data-student-id="${s.id}">🗑️ delete</button>
              </div>
            </div>
        `
        studentListContainer.appendChild(list)
    })
}


// Class Crud================================

newClassName.addEventListener("keyup", (event) => {
    if (event.key === "Enter") loadNewClass()
})

addClassBtn.addEventListener("click", () => {
    loadNewClass()
})

const loadNewClass = async () => {
    const newClassValue = newClassName.value
    const res = await fetch(api + "/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassValue })
    })
    if (!res.ok) {
        console.log("Request failed")
        return
    }
    newClassName.value = ""
    await displayClasses()
    await showStats()
}

const displayClasses = async () => {
    classListContainer.innerHTML = ""
    const res = await fetch(api + "/classes")
    if (!res.ok) {
        console.log("Request failed")
        return
    }
    const data = await res.json()
    classes = Array.isArray(data) ? data : []
    classes.forEach(el => {
        const classBadge = document.createElement("span")
        classBadge.innerHTML = `
        <span class="badge bg-blue-900/60 text-blue-200 py-3 px-3 border border-blue-700/50 flex items-center gap-1">
            ${el.name} 
            <button onclick="deleteClass(${el.id})" class="delete-class-btn text-blue-300 hover:text-white">✕</button>
        </span>
        `
        classListContainer.appendChild(classBadge)
    })
    valueSelect()
}

const deleteClass = async (classId) => {
    const res = await fetch(api + "/students")
    let students = []
    try {
        students = await res.json()
        if (!Array.isArray(students)) students = []
    } catch (e) {
        console.log("Error parsing students response:", e)
        students = []
    }

    const hasStudents = students.some(s => s.class_id === classId)

    if (hasStudents) {
        const ok = confirm("This class has students. Delete them all?")
        if (!ok) return
        await fetch(api + "/students/class/" + classId, { method: "DELETE" })
    }

    await fetch(api + "/classes/" + classId, { method: "DELETE" })

    await displayClasses()
    await displayStudents()
    await showStats()
}

const valueSelect = () => {
    classSelect.innerHTML = '<option value="">— select class —</option>' +
        classes.map(c => `<option value="${c.id}">${c.name}</option>`)
    filterClass.innerHTML = '<option value="">— select class —</option>' +
        classes.map(c => `<option value="${c.id}">${c.name}</option>`)
}


// Student Crud======================================

studentListContainer.addEventListener("dblclick", async (event) => {
    if (event.target.closest(".student-card")) {
        if (event.target.closest(".delete-student")) return

        const card = event.target.closest(".student-card")
        const id = parseInt(card.dataset.studentId)

        editingStudentId = id
        const res = await fetch(api + "/students/" + id)
        const student = await res.json()

        if (!student) return

        studentName.value = student.name
        studentAge.value = student.age
        studentMarks.value = student.marks
        studentPresent.value = student.present
        classSelect.value = student.class_id
    }
})

studentListContainer.addEventListener("click", (event) => {
    if (event.target.closest(".delete-student")) {
        const btn = event.target.closest(".delete-student")
        const id = parseInt(btn.dataset.studentId)
        deleteStudent(id)
    }
})

addStudentBtn.addEventListener("click", () => {
    createStudent()
})

updateStudentBtn.addEventListener("click", async () => {
    if (editingStudentId === null) return
    const name = studentName.value
    const age = parseInt(studentAge.value)
    const marks = parseInt(studentMarks.value)
    const present = parseInt(studentPresent.value)
    const class_id = parseInt(classSelect.value)

    await fetch(api + "/students/" + editingStudentId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, marks, age, present, class_id })
    })

    resetForm()
    await displayStudents()
    await showStats()
})

deleteStudentBtn.addEventListener("click", async () => {
    await fetch(api + "/students/" + editingStudentId, { method: "DELETE" })
    resetForm()
    await displayStudents()
    await showStats()
})

const resetForm = () => {
    studentName.value = ""
    studentAge.value = ""
    studentMarks.value = ""
    studentPresent.value = ""
    classSelect.value = ""
    editingStudentId = null
}

const createStudent = async () => {
    const name = studentName.value
    const age = parseInt(studentAge.value)
    const marks = parseInt(studentMarks.value)
    const present = parseInt(studentPresent.value)
    const class_id = parseInt(classSelect.value)

    await fetch(api + "/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, marks, present, class_id })
    })

    resetForm()
    await displayStudents()
    await showStats()
}

const displayStudents = async () => {
    const res = await fetch(api + "/students")
    const students = await res.json()
    if (!Array.isArray(students)) {
        console.error("Expected array but got:", students)
        return
    }
    renderStudents(students, "No students yet — add one above")
}

function getClassName(classId) {
    const found = classes.find(c => c.id === classId)
    return found ? found.name : "—"
}

const deleteStudent = async (id) => {
    await fetch(api + "/students/" + id, { method: "DELETE" })
    await displayStudents()
    await showStats()
}

// ================Filter Students=================

const filterStudents = async () => {
    let url = api + "/students/filtered?"
    const name = filterName.value
    const classId = filterClass.value
    const marks = filterMarksMin.value
    const present = filterPresentMin.value

    if (name) url += "name=" + name + "&"
    if (classId) url += "class_id=" + classId + "&"
    if (marks) url += "marks=" + marks + "&"
    if (present) url += "present=" + present + "&"

    const res = await fetch(url)
    const students = await res.json()

    const isFiltered = name || classId || marks || present
    renderStudents(students, isFiltered ? "No students match your filters" : "No students yet — add one above")
}

applyFilterBtn.addEventListener("click", filterStudents)

filterName.addEventListener("input", () => {
    if (filterName.value === "") {
        displayStudents()
    } else {
        filterStudents()
    }
})


// ================Report Generator=================

const generateReport = async () => {
    // Fetch fresh data
    const [studentsRes, statsRes] = await Promise.all([
        fetch(api + "/students"),
        fetch(api + "/stats")
    ])
    const students = await studentsRes.json()
    const stats = await statsRes.json()

    const now = new Date()
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    // Per-class breakdown
    const classBreakdown = classes.map(cls => {
        const classStudents = students.filter(s => s.class_id === cls.id)
        const avgMarks = classStudents.length
            ? (classStudents.reduce((sum, s) => sum + s.marks, 0) / classStudents.length).toFixed(1)
            : "—"
        const avgPresent = classStudents.length
            ? (classStudents.reduce((sum, s) => sum + s.present, 0) / classStudents.length).toFixed(1)
            : "—"
        return { name: cls.name, count: classStudents.length, avgMarks, avgPresent }
    })

    // Top 5 students by marks
    const top5 = [...students].sort((a, b) => b.marks - a.marks).slice(0, 5)

    // Students needing attention (marks < 60 or present < 15)
    const needsAttention = students.filter(s => s.marks < 60 || s.present < 15)

    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Student Report — ${dateStr}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #f8fafc; padding: 40px; }
        .header { text-align: center; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 3px solid #3b82f6; }
        .header h1 { font-size: 28px; color: #1e40af; font-weight: 700; }
        .header p { color: #64748b; margin-top: 6px; font-size: 14px; }
        .section { margin-bottom: 32px; }
        .section h2 { font-size: 16px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
        .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
        .stat-card .value { font-size: 26px; font-weight: 700; color: #2563eb; }
        .stat-card .label { font-size: 11px; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
        thead { background: #1e40af; color: white; }
        th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
        td { padding: 9px 14px; border-bottom: 1px solid #f1f5f9; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge-pass { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-fail { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-warn { background: #fef9c3; color: #854d0e; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; padding-top: 16px; border-top: 1px solid #e2e8f0; }
        @media print {
            body { padding: 20px; background: white; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>🎓 Student Management Report</h1>
        <p>Generated on ${dateStr} at ${timeStr}</p>
    </div>

    <!-- Stats Summary -->
    <div class="section">
        <h2>📊 Overview</h2>
        <div class="stats-grid">
            <div class="stat-card"><div class="value">${stats.total_students}</div><div class="label">Total Students</div></div>
            <div class="stat-card"><div class="value">${stats.total_classes}</div><div class="label">Total Classes</div></div>
            <div class="stat-card"><div class="value">${stats.avg_marks.toFixed(1)}%</div><div class="label">Avg Marks</div></div>
            <div class="stat-card"><div class="value">${stats.avg_present.toFixed(1)}</div><div class="label">Avg Present</div></div>
            <div class="stat-card"><div class="value">${stats.total_present}</div><div class="label">Total Present</div></div>
        </div>
    </div>

    <!-- Class Breakdown -->
    <div class="section">
        <h2>🏫 Class Breakdown</h2>
        <table>
            <thead>
                <tr><th>Class</th><th>Students</th><th>Avg Marks</th><th>Avg Attendance</th></tr>
            </thead>
            <tbody>
                ${classBreakdown.map(c => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.count}</td>
                    <td>${c.avgMarks}${c.avgMarks !== "—" ? "%" : ""}</td>
                    <td>${c.avgPresent}</td>
                </tr>`).join("")}
            </tbody>
        </table>
    </div>

    <!-- Top 5 Students -->
    <div class="section">
        <h2>🏆 Top 5 Students by Marks</h2>
        <table>
            <thead>
                <tr><th>Rank</th><th>Name</th><th>Class</th><th>Marks</th><th>Attendance</th></tr>
            </thead>
            <tbody>
                ${top5.map((s, i) => `
                <tr>
                    <td>${["🥇","🥈","🥉","4th","5th"][i]}</td>
                    <td>${s.name}</td>
                    <td>${getClassName(s.class_id)}</td>
                    <td><span class="badge-pass">${s.marks}%</span></td>
                    <td>${s.present}</td>
                </tr>`).join("")}
            </tbody>
        </table>
    </div>

    <!-- Needs Attention -->
    <div class="section">
        <h2>⚠️ Students Needing Attention (Marks &lt; 60 or Attendance &lt; 15)</h2>
        ${needsAttention.length === 0
            ? `<p style="color:#64748b; font-size:14px; padding: 12px 0;">✅ All students are performing well!</p>`
            : `<table>
            <thead>
                <tr><th>Name</th><th>Class</th><th>Marks</th><th>Attendance</th><th>Issue</th></tr>
            </thead>
            <tbody>
                ${needsAttention.map(s => `
                <tr>
                    <td>${s.name}</td>
                    <td>${getClassName(s.class_id)}</td>
                    <td>${s.marks}%</td>
                    <td>${s.present}</td>
                    <td>
                        ${s.marks < 60 ? '<span class="badge-fail">Low Marks</span>' : ""}
                        ${s.present < 15 ? '<span class="badge-warn">Low Attendance</span>' : ""}
                    </td>
                </tr>`).join("")}
            </tbody>
        </table>`}
    </div>

    <!-- All Students -->
    <div class="section">
        <h2>👥 All Students</h2>
        <table>
            <thead>
                <tr><th>ID</th><th>Name</th><th>Age</th><th>Class</th><th>Marks</th><th>Attendance</th><th>Status</th></tr>
            </thead>
            <tbody>
                ${students.map(s => `
                <tr>
                    <td>${s.id}</td>
                    <td>${s.name}</td>
                    <td>${s.age}</td>
                    <td>${getClassName(s.class_id)}</td>
                    <td>${s.marks}%</td>
                    <td>${s.present}</td>
                    <td>${s.marks >= 60 ? '<span class="badge-pass">Pass</span>' : '<span class="badge-fail">Fail</span>'}</td>
                </tr>`).join("")}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Student Management System &nbsp;•&nbsp; ${dateStr} &nbsp;•&nbsp; All rights reserved
    </div>

</body>
</html>`

    // Open in new tab and trigger print dialog
    const win = window.open("", "_blank")
    win.document.write(reportHTML)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
}

// Attach to report button
const reportBtn = document.getElementById("reportBtn")
if (reportBtn) {
    reportBtn.addEventListener("click", generateReport)
}


// ================Init=================
const init = async () => {
    await displayClasses()
    await displayStudents()
    await showStats()
}

init()