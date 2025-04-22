document.addEventListener('DOMContentLoaded', () => {
    loadGpaData();
    loadCgpaData();
    setupEventListeners();
});

function setupEventListeners() {
    // GPA Form Submission
    const gpaForm = document.getElementById('gpaForm');
    if (gpaForm) {
        gpaForm.addEventListener('submit', handleGpaSubmit);
    }

    // CGPA Form Submission
    const cgpaForm = document.getElementById('cgpaForm');
    if (cgpaForm) {
        cgpaForm.addEventListener('submit', handleCgpaSubmit);
    }

    // GPA Clear Button
    const clearGpaBtn = document.getElementById('clearBtn'); // Assuming 'clearBtn' is for GPA
    if (clearGpaBtn) {
        clearGpaBtn.addEventListener('click', clearGpaForm);
    }

    // CGPA Clear Button (We'll add this button to HTML later)
    const clearCgpaBtn = document.getElementById('clearCgpaBtn');
    if (clearCgpaBtn) {
        clearCgpaBtn.addEventListener('click', clearCgpaForm);
    }

    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Hamburger Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && closeMenu && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.add('active');
        });
        closeMenu.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    }

    // Add event listeners to dynamically added delete buttons if needed,
    // or rely on onclick attributes as currently implemented.
}


// --- GPA Functions ---

function addCourse(percentageValue = '') {
    const coursesDiv = document.getElementById('courses');
    if (!coursesDiv) return;
    const newCourse = document.createElement('div');
    newCourse.className = 'course';
    newCourse.innerHTML = `
        <button type="button" class="delete-btn" onclick="deleteCourse(this)"><i class="fas fa-trash"></i></button>
        <input type="number" placeholder="Percentage" min="0" max="100" value="${percentageValue}" required>
    `;
    coursesDiv.appendChild(newCourse);
    // No need to save here, save on calculate or explicit save action if added
}

function deleteCourse(button) {
    button.parentElement.remove();
    saveGpaData(); // Save after deleting
    // Optionally recalculate GPA if a result is displayed
    // handleGpaSubmit(new Event('submit')); // This might be too aggressive
}

function handleGpaSubmit(event) {
    event.preventDefault();
    const courseInputs = document.querySelectorAll('#courses .course input');
    let totalGradePoints = 0;
    let totalCourses = 0;
    let validDataEntered = false;

    courseInputs.forEach(input => {
        const percentage = parseFloat(input.value);
        if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            const gradePoint = getGradePoint(percentage);
            totalGradePoints += gradePoint;
            totalCourses++;
            validDataEntered = true; // Mark that we have at least one valid input
        } else if (input.value.trim() !== '') {
             // If input is not empty but invalid, still consider it an attempt
             validDataEntered = true;
        }
    });

    const gpaResultDiv = document.getElementById('gpaResult');
    if (!gpaResultDiv) return;

    if (totalCourses === 0) {
         if (validDataEntered || courseInputs.length > 0) {
            // Alert only if fields were filled (even if invalid) or if fields exist
             alert('Please enter at least one valid percentage (0-100).');
         }
         gpaResultDiv.innerText = ''; // Clear previous result
         // Don't save if calculation failed due to no valid data
         return;
    }


    const gpa = totalGradePoints / totalCourses;
    gpaResultDiv.innerText = `Your GPA is: ${gpa.toFixed(2)}`;

    // Trigger animation
    gpaResultDiv.classList.remove('animate-result'); // Reset animation
    void gpaResultDiv.offsetWidth; // Force reflow
    gpaResultDiv.classList.add('animate-result'); // Add class to animate

    saveGpaData(); // Save data after successful calculation
}

function saveGpaData() {
    const courseInputs = document.querySelectorAll('#courses .course input');
    const percentages = Array.from(courseInputs).map(input => input.value);
    localStorage.setItem('gpaCourses', JSON.stringify(percentages));
}

function loadGpaData() {
    const savedPercentages = JSON.parse(localStorage.getItem('gpaCourses') || '[]');
    const coursesDiv = document.getElementById('courses');
    if (!coursesDiv) return;

    // Clear existing courses before loading (important!)
    coursesDiv.innerHTML = '';

    if (savedPercentages.length === 0) {
        // If no saved data, add one empty course row by default
        addCourse();
    } else {
        savedPercentages.forEach(percentage => {
            addCourse(percentage); // Add course with the saved value
        });
    }
}

function clearGpaForm() {
    const coursesDiv = document.getElementById('courses');
    const gpaResultDiv = document.getElementById('gpaResult');
    if (coursesDiv) coursesDiv.innerHTML = ''; // Clear all course inputs
    if (gpaResultDiv) gpaResultDiv.innerText = ''; // Clear result
    localStorage.removeItem('gpaCourses'); // Clear saved data
    addCourse(); // Add back one empty course row
}


// --- CGPA Functions ---

function addSemester(gpaValue = '') {
    const semestersDiv = document.getElementById('semesters');
    if (!semestersDiv) return;
    const semesterCount = semestersDiv.children.length + 1;
    const newSemester = document.createElement('div');
    newSemester.className = 'semester';
    // Add delete button similar to courses
    newSemester.innerHTML = `
        <button type="button" class="delete-btn" onclick="deleteSemester(this)"><i class="fas fa-trash"></i></button>
        <input type="number" placeholder="GPA for Semester ${semesterCount}" min="0" max="4" step="0.01" value="${gpaValue}" required>
    `;
    semestersDiv.appendChild(newSemester);
    updateSemesterPlaceholders();
}

function deleteSemester(button) {
    button.parentElement.remove();
    updateSemesterPlaceholders();
    saveCgpaData(); // Save after deleting
}

function updateSemesterPlaceholders() {
    const semesterInputs = document.querySelectorAll('#semesters .semester input');
    semesterInputs.forEach((input, index) => {
        input.placeholder = `GPA for Semester ${index + 1}`;
    });
}


function handleCgpaSubmit(event) {
    event.preventDefault();
    const semesterInputs = document.querySelectorAll('#semesters .semester input');
    let totalGPA = 0;
    let totalSemesters = 0;
    let validDataEntered = false;

    semesterInputs.forEach(input => {
        const gpa = parseFloat(input.value);
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4) {
            totalGPA += gpa;
            totalSemesters++;
            validDataEntered = true;
        } else if (input.value.trim() !== '') {
            validDataEntered = true;
        }
    });

    const cgpaResultDiv = document.getElementById('cgpaResult');
     if (!cgpaResultDiv) return;

    if (totalSemesters === 0) {
        if (validDataEntered || semesterInputs.length > 0) {
            alert('Please enter at least one valid semester GPA (0.00-4.00).');
        }
        cgpaResultDiv.innerText = ''; // Clear previous result
        // Don't save if calculation failed
        return;
    }

    const cgpa = totalGPA / totalSemesters;
    cgpaResultDiv.innerText = `Your CGPA is: ${cgpa.toFixed(2)}`;

    // Trigger animation
    cgpaResultDiv.classList.remove('animate-result'); // Reset animation
    void cgpaResultDiv.offsetWidth; // Force reflow
    cgpaResultDiv.classList.add('animate-result'); // Add class to animate

    saveCgpaData(); // Save data after successful calculation
}

function saveCgpaData() {
    const semesterInputs = document.querySelectorAll('#semesters .semester input');
    const gpas = Array.from(semesterInputs).map(input => input.value);
    localStorage.setItem('cgpaSemesters', JSON.stringify(gpas));
}

function loadCgpaData() {
    const savedGpas = JSON.parse(localStorage.getItem('cgpaSemesters') || '[]');
    const semestersDiv = document.getElementById('semesters');
    if (!semestersDiv) return;

    // Clear existing semesters before loading
    semestersDiv.innerHTML = '';

    if (savedGpas.length === 0) {
        // Add one empty semester row by default
        addSemester();
    } else {
        savedGpas.forEach(gpa => {
            addSemester(gpa); // Add semester with the saved value
        });
    }
     updateSemesterPlaceholders(); // Ensure placeholders are correct after loading
}

function clearCgpaForm() {
    const semestersDiv = document.getElementById('semesters');
    const cgpaResultDiv = document.getElementById('cgpaResult');
    if (semestersDiv) semestersDiv.innerHTML = ''; // Clear all semester inputs
    if (cgpaResultDiv) cgpaResultDiv.innerText = ''; // Clear result
    localStorage.removeItem('cgpaSemesters'); // Clear saved data
    addSemester(); // Add back one empty semester row
}


// --- Helper & UI Functions ---

function getGradePoint(percentage) {
    // Existing grade point logic...
    if (percentage >= 95) return 4.0;
    if (percentage >= 90) return 4.0; // Assuming 90-100 is 4.0 based on common scales
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

// Gallery Carousel Logic (Keep as is if needed)
// ... (existing gallery code) ...

// Note: Removed gallery code for brevity in this example,
// but it should remain if it's part of the original script.

// Make sure functions called by onclick attributes are globally accessible
window.addCourse = addCourse;
window.deleteCourse = deleteCourse;
window.addSemester = addSemester;
window.deleteSemester = deleteSemester;
