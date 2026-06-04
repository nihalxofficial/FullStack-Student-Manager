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

// ================Init=================
const init = async () => {
    await displayClasses()   
    await displayStudents()  
    await showStats()
}

init()