// Function to add a new course input field
function addCourse() {
    const coursesDiv = document.getElementById('courses');
    const newCourse = document.createElement('div');
    newCourse.className = 'course';
    newCourse.innerHTML = `
        <button type="button" class="delete-btn" onclick="deleteCourse(this)"><i class="fas fa-trash"></i></button>
        <input type="number" placeholder="Percentage" min="0" max="100" required>
    `;
    coursesDiv.appendChild(newCourse);
}

// Function to delete a course input field
function deleteCourse(button) {
    button.parentElement.remove();
}

// GPA Calculation Logic
document.getElementById('gpaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const courseInputs = document.querySelectorAll('.course input');
    let totalGradePoints = 0;
    let totalCourses = 0;

    courseInputs.forEach(input => {
        const percentage = parseFloat(input.value);
        if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
            const gradePoint = getGradePoint(percentage);
            totalGradePoints += gradePoint;
            totalCourses++;
        }
    });

    if (totalCourses === 0) {
        alert('Please enter at least one valid percentage.');
        return;
    }

    const gpa = totalGradePoints / totalCourses;
    document.getElementById('gpaResult').innerText = `Your GPA is: ${gpa.toFixed(2)}`;
});

// Function to add a new semester input field
function addSemester() {
    const semestersDiv = document.getElementById('semesters');
    const semesterCount = semestersDiv.children.length + 1;
    const newSemester = document.createElement('div');
    newSemester.className = 'semester';
    newSemester.innerHTML = `
        <button type="button" class="delete-btn" onclick="deleteSemester(this)"><i class="fas fa-trash"></i></button>
        <input type="number" placeholder="GPA for Semester ${semesterCount}" min="0" max="4" step="0.01" required>
    `;
    semestersDiv.appendChild(newSemester);
}

// Function to delete a semester input field
function deleteSemester(button) {
    button.parentElement.remove();
}

// CGPA Calculation Logic
document.getElementById('cgpaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const semesterInputs = document.querySelectorAll('.semester input');
    let totalGPA = 0;
    let totalSemesters = 0;

    semesterInputs.forEach(input => {
        const gpa = parseFloat(input.value);
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4) {
            totalGPA += gpa;
            totalSemesters++;
        }
    });

    if (totalSemesters === 0) {
        alert('Please enter at least one valid GPA.');
        return;
    }

    const cgpa = totalGPA / totalSemesters;
    document.getElementById('cgpaResult').innerText = `Your CGPA is: ${cgpa.toFixed(2)}`;
});

// Helper function to convert percentage to grade point
function getGradePoint(percentage) {
    if (percentage >= 95) return 4.0;
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

// Gallery Carousel Logic
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
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