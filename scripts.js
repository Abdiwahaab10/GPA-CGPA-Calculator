document.addEventListener('DOMContentLoaded', () => {
    loadGpaData();
    loadCgpaData();
    setupEventListeners();
});

function setupEventListeners() {
    const gpaForm = document.getElementById('gpaForm');
    if (gpaForm) {
        gpaForm.addEventListener('submit', handleGpaSubmit);
    }

    const cgpaForm = document.getElementById('cgpaForm');
    if (cgpaForm) {
        cgpaForm.addEventListener('submit', handleCgpaSubmit);
    }

    const plannerForm = document.getElementById('plannerForm');
    if (plannerForm) {
        plannerForm.addEventListener('submit', handlePlannerSubmit);
    }

    const clearGpaBtn = document.getElementById('clearBtn');
    if (clearGpaBtn) {
        clearGpaBtn.addEventListener('click', clearGpaForm);
    }

    const clearCgpaBtn = document.getElementById('clearCgpaBtn');
    if (clearCgpaBtn) {
        clearCgpaBtn.addEventListener('click', clearCgpaForm);
    }

    const clearPlannerBtn = document.getElementById('clearPlannerBtn');
    if (clearPlannerBtn) {
        clearPlannerBtn.addEventListener('click', clearPlannerForm);
    }

    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', exportGpaPdf);
    }

    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportGpaExcel);
    }

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            scrollToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && closeMenu && navLinks) {
        menuToggle.addEventListener('click', () => navLinks.classList.add('active'));
        closeMenu.addEventListener('click', () => navLinks.classList.remove('active'));
    }
}

function addCourse(percentageValue = '', creditsValue = '3') {
    const coursesDiv = document.getElementById('courses');
    if (!coursesDiv) return;

    const newCourse = document.createElement('div');
    newCourse.className = 'course';
    newCourse.innerHTML = `
        <button type="button" class="delete-btn" onclick="deleteCourse(this)"><i class="fas fa-trash"></i></button>
        <input type="number" placeholder="Percentage" min="0" max="100" value="${percentageValue}" required>
        <input type="number" placeholder="Credits" min="0.5" step="0.5" value="${creditsValue}" required>
    `;
    coursesDiv.appendChild(newCourse);
}

function deleteCourse(button) {
    const coursesDiv = document.getElementById('courses');
    if (coursesDiv && coursesDiv.children.length === 1) return;
    button.parentElement.remove();
    saveGpaData();
}

function handleGpaSubmit(event) {
    event.preventDefault();
    const courseRows = document.querySelectorAll('#courses .course');
    const gradingScale = document.getElementById('gradingScale')?.value || 'standard4';

    let totalWeightedPoints = 0;
    let totalCredits = 0;
    const breakdown = [];

    courseRows.forEach((row, index) => {
        const [percentageInput, creditsInput] = row.querySelectorAll('input');
        const percentage = parseFloat(percentageInput.value);
        const credits = parseFloat(creditsInput.value);

        if (!isNaN(percentage) && percentage >= 0 && percentage <= 100 && !isNaN(credits) && credits > 0) {
            const gradePoint = getGradePoint(percentage, gradingScale);
            totalWeightedPoints += gradePoint * credits;
            totalCredits += credits;
            breakdown.push({ index: index + 1, percentage, credits, gradePoint });
        }
    });

    const gpaResultDiv = document.getElementById('gpaResult');
    const gpaBreakdown = document.getElementById('gpaBreakdown');
    if (!gpaResultDiv || !gpaBreakdown) return;

    if (totalCredits === 0) {
        alert('Please enter valid percentages and credits.');
        gpaResultDiv.innerText = '';
        gpaBreakdown.innerHTML = '';
        return;
    }

    const gpa = totalWeightedPoints / totalCredits;
    gpaResultDiv.innerText = `Your GPA is: ${gpa.toFixed(2)} (Weighted)`;
    gpaResultDiv.classList.remove('animate-result', 'gpa-excellent', 'gpa-good', 'gpa-average', 'gpa-low');
    void gpaResultDiv.offsetWidth;
    gpaResultDiv.classList.add('animate-result', getGpaColorClass(gpa));

    gpaBreakdown.innerHTML = `
        <h4>Course Breakdown</h4>
        <ul>
            ${breakdown.map(item => `<li>Course ${item.index}: ${item.percentage}% • ${item.credits} credits • ${item.gradePoint.toFixed(2)} GP</li>`).join('')}
        </ul>
    `;

    saveGpaData();
}

function saveGpaData() {
    const courseRows = document.querySelectorAll('#courses .course');
    const courses = Array.from(courseRows).map(row => {
        const [percentageInput, creditsInput] = row.querySelectorAll('input');
        return {
            percentage: percentageInput.value,
            credits: creditsInput.value
        };
    });
    const gradingScale = document.getElementById('gradingScale')?.value || 'standard4';
    localStorage.setItem('gpaCourses', JSON.stringify(courses));
    localStorage.setItem('gpaScale', gradingScale);
}

function loadGpaData() {
    const savedCourses = JSON.parse(localStorage.getItem('gpaCourses') || '[]');
    const savedScale = localStorage.getItem('gpaScale') || 'standard4';
    const coursesDiv = document.getElementById('courses');
    const gradingScale = document.getElementById('gradingScale');
    if (!coursesDiv) return;

    coursesDiv.innerHTML = '';

    if (savedCourses.length === 0) {
        addCourse();
    } else {
        savedCourses.forEach(course => {
            addCourse(course.percentage || '', course.credits || '3');
        });
    }

    if (gradingScale) {
        gradingScale.value = savedScale;
        gradingScale.addEventListener('change', saveGpaData);
    }
}

function clearGpaForm() {
    const coursesDiv = document.getElementById('courses');
    const gpaResultDiv = document.getElementById('gpaResult');
    const gpaBreakdown = document.getElementById('gpaBreakdown');
    if (coursesDiv) coursesDiv.innerHTML = '';
    if (gpaResultDiv) {
        gpaResultDiv.innerText = '';
        gpaResultDiv.className = 'result';
    }
    if (gpaBreakdown) gpaBreakdown.innerHTML = '';
    localStorage.removeItem('gpaCourses');
    localStorage.removeItem('gpaScale');
    addCourse();
}

function addSemester(gpaValue = '', creditsValue = '15') {
    const semestersDiv = document.getElementById('semesters');
    if (!semestersDiv) return;

    const semesterCount = semestersDiv.children.length + 1;
    const newSemester = document.createElement('div');
    newSemester.className = 'semester';
    newSemester.innerHTML = `
        <button type="button" class="delete-btn" onclick="deleteSemester(this)"><i class="fas fa-trash"></i></button>
        <input type="number" placeholder="GPA for Semester ${semesterCount}" min="0" max="4" step="0.01" value="${gpaValue}" required>
        <input type="number" placeholder="Semester Credits" min="1" step="1" value="${creditsValue}" required>
    `;
    semestersDiv.appendChild(newSemester);
    updateSemesterPlaceholders();
}

function deleteSemester(button) {
    const semestersDiv = document.getElementById('semesters');
    if (semestersDiv && semestersDiv.children.length === 1) return;
    button.parentElement.remove();
    updateSemesterPlaceholders();
    saveCgpaData();
}

function updateSemesterPlaceholders() {
    const semesterRows = document.querySelectorAll('#semesters .semester');
    semesterRows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        inputs[0].placeholder = `GPA for Semester ${index + 1}`;
    });
}

function handleCgpaSubmit(event) {
    event.preventDefault();
    const semesterRows = document.querySelectorAll('#semesters .semester');

    let totalWeightedGpa = 0;
    let totalCredits = 0;

    semesterRows.forEach(row => {
        const [gpaInput, creditsInput] = row.querySelectorAll('input');
        const gpa = parseFloat(gpaInput.value);
        const credits = parseFloat(creditsInput.value);

        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4 && !isNaN(credits) && credits > 0) {
            totalWeightedGpa += gpa * credits;
            totalCredits += credits;
        }
    });

    const cgpaResultDiv = document.getElementById('cgpaResult');
    if (!cgpaResultDiv) return;

    if (totalCredits === 0) {
        alert('Please enter valid semester GPA and credits.');
        cgpaResultDiv.innerText = '';
        return;
    }

    const cgpa = totalWeightedGpa / totalCredits;
    cgpaResultDiv.innerText = `Your CGPA is: ${cgpa.toFixed(2)} (Weighted)`;
    cgpaResultDiv.classList.remove('animate-result', 'gpa-excellent', 'gpa-good', 'gpa-average', 'gpa-low');
    void cgpaResultDiv.offsetWidth;
    cgpaResultDiv.classList.add('animate-result', getGpaColorClass(cgpa));

    saveCgpaData();
}

function saveCgpaData() {
    const semesterRows = document.querySelectorAll('#semesters .semester');
    const semesters = Array.from(semesterRows).map(row => {
        const [gpaInput, creditsInput] = row.querySelectorAll('input');
        return {
            gpa: gpaInput.value,
            credits: creditsInput.value
        };
    });
    localStorage.setItem('cgpaSemesters', JSON.stringify(semesters));
}

function loadCgpaData() {
    const savedSemesters = JSON.parse(localStorage.getItem('cgpaSemesters') || '[]');
    const semestersDiv = document.getElementById('semesters');
    if (!semestersDiv) return;

    semestersDiv.innerHTML = '';

    if (savedSemesters.length === 0) {
        addSemester();
    } else {
        savedSemesters.forEach(semester => {
            addSemester(semester.gpa || '', semester.credits || '15');
        });
    }

    updateSemesterPlaceholders();
}

function clearCgpaForm() {
    const semestersDiv = document.getElementById('semesters');
    const cgpaResultDiv = document.getElementById('cgpaResult');
    if (semestersDiv) semestersDiv.innerHTML = '';
    if (cgpaResultDiv) {
        cgpaResultDiv.innerText = '';
        cgpaResultDiv.className = 'result';
    }
    localStorage.removeItem('cgpaSemesters');
    addSemester();
}

function handlePlannerSubmit(event) {
    event.preventDefault();

    const currentCgpa = parseFloat(document.getElementById('currentCgpa')?.value);
    const completedCredits = parseFloat(document.getElementById('completedCredits')?.value);
    const upcomingCredits = parseFloat(document.getElementById('upcomingCredits')?.value);
    const targetCgpa = parseFloat(document.getElementById('targetCgpa')?.value);
    const plannerResultDiv = document.getElementById('plannerResult');

    if (!plannerResultDiv) return;

    if ([currentCgpa, completedCredits, upcomingCredits, targetCgpa].some(v => isNaN(v)) || completedCredits <= 0 || upcomingCredits <= 0) {
        plannerResultDiv.innerText = 'Please enter valid values in all planner fields.';
        return;
    }

    const totalTargetPoints = targetCgpa * (completedCredits + upcomingCredits);
    const currentPoints = currentCgpa * completedCredits;
    const requiredGpa = (totalTargetPoints - currentPoints) / upcomingCredits;

    if (requiredGpa > 4) {
        plannerResultDiv.innerText = `You need ${requiredGpa.toFixed(2)} GPA, which is above 4.0. Consider adjusting your target.`;
        plannerResultDiv.classList.remove('gpa-excellent', 'gpa-good', 'gpa-average', 'gpa-low');
        plannerResultDiv.classList.add('gpa-low');
    } else if (requiredGpa < 0) {
        plannerResultDiv.innerText = 'You already exceeded this target. Great job!';
        plannerResultDiv.classList.remove('gpa-excellent', 'gpa-good', 'gpa-average', 'gpa-low');
        plannerResultDiv.classList.add('gpa-excellent');
    } else {
        plannerResultDiv.innerText = `Required GPA for upcoming credits: ${requiredGpa.toFixed(2)}`;
        plannerResultDiv.classList.remove('gpa-excellent', 'gpa-good', 'gpa-average', 'gpa-low');
        plannerResultDiv.classList.add(getGpaColorClass(requiredGpa));
    }

    plannerResultDiv.classList.remove('animate-result');
    void plannerResultDiv.offsetWidth;
    plannerResultDiv.classList.add('animate-result');
}

function clearPlannerForm() {
    const plannerForm = document.getElementById('plannerForm');
    const plannerResultDiv = document.getElementById('plannerResult');
    if (plannerForm) plannerForm.reset();
    if (plannerResultDiv) {
        plannerResultDiv.innerText = '';
        plannerResultDiv.className = 'result';
    }
}

function getGpaColorClass(gpa) {
    if (gpa >= 3.5) return 'gpa-excellent';
    if (gpa >= 3.0) return 'gpa-good';
    if (gpa >= 2.0) return 'gpa-average';
    return 'gpa-low';
}

function getGradePoint(percentage, scale = 'standard4') {
    if (scale === 'plusMinus') {
        if (percentage >= 97) return 4.0;
        if (percentage >= 93) return 4.0;
        if (percentage >= 90) return 3.7;
        if (percentage >= 87) return 3.3;
        if (percentage >= 83) return 3.0;
        if (percentage >= 80) return 2.7;
        if (percentage >= 77) return 2.3;
        if (percentage >= 73) return 2.0;
        if (percentage >= 70) return 1.7;
        if (percentage >= 67) return 1.3;
        if (percentage >= 63) return 1.0;
        if (percentage >= 60) return 0.7;
        return 0.0;
    }

    if (percentage >= 90) return 4.0;
    if (percentage >= 85) return 3.7;
    if (percentage >= 80) return 3.3;
    if (percentage >= 75) return 3.0;
    if (percentage >= 70) return 2.7;
    if (percentage >= 65) return 2.3;
    if (percentage >= 60) return 2.0;
    if (percentage >= 55) return 1.7;
    if (percentage >= 50) return 1.0;
    return 0.0;
}

function exportGpaPdf() {
    const gpaText = document.getElementById('gpaResult')?.innerText;
    const breakdownText = document.getElementById('gpaBreakdown')?.innerText;
    if (!gpaText) {
        alert('Calculate GPA first before exporting.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('GPA Report', 20, 20);
    doc.setFontSize(12);
    doc.text(gpaText, 20, 35);
    if (breakdownText) {
        doc.text(breakdownText, 20, 50, { maxWidth: 170 });
    }
    doc.save('gpa-report.pdf');
}

function exportGpaExcel() {
    const courseRows = document.querySelectorAll('#courses .course');
    const rows = [];

    courseRows.forEach((row, index) => {
        const [percentageInput, creditsInput] = row.querySelectorAll('input');
        const percentage = parseFloat(percentageInput.value);
        const credits = parseFloat(creditsInput.value);
        if (!isNaN(percentage) && !isNaN(credits)) {
            rows.push({
                Course: `Course ${index + 1}`,
                Percentage: percentage,
                Credits: credits
            });
        }
    });

    if (rows.length === 0) {
        alert('No valid data to export.');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GPA Data');
    XLSX.writeFile(workbook, 'gpa-data.xlsx');
}

window.addCourse = addCourse;
window.deleteCourse = deleteCourse;
window.addSemester = addSemester;
window.deleteSemester = deleteSemester;
