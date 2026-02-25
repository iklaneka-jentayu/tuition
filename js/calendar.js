// ====================================
// EduSmart Tuition Platform
// Calendar Scheduler JavaScript
// Complete CRUD Functionality
// ====================================

// Global Variables
let calendar;
let currentEvents = [];
let teachers = [];
let students = [];
let currentEventId = null;
let currentDeleteId = null;

// Initialize on Document Ready
$(document).ready(function() {
    initializeCalendar();
    loadInitialData();
    setupEventListeners();
    initializeSelect2();
});

// Initialize Calendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day'
        },
        events: loadEvents,
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventDrop: function(info) {
            updateEventDate(info.event);
        },
        eventResize: function(info) {
            updateEventDuration(info.event);
        },
        selectable: true,
        select: function(info) {
            openEventModal(info.start, info.end);
        },
        editable: true,
        droppable: true,
        eventColor: '#4a6bff',
        eventTextColor: '#ffffff',
        eventDisplay: 'block',
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        slotDuration: '00:30:00',
        allDaySlot: false,
        nowIndicator: true,
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
            startTime: '09:00',
            endTime: '21:00',
        },
        eventClassNames: function(arg) {
            const classes = [];
            if (arg.event.extendedProps.subject) {
                classes.push(arg.event.extendedProps.subject.toLowerCase().replace(' ', '-'));
            }
            if (arg.event.extendedProps.type) {
                classes.push(arg.event.extendedProps.type);
            }
            return classes;
        }
    });
    
    calendar.render();
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load teachers
        teachers = await getTeachers();
        populateTeacherFilter();
        
        // Load students
        students = await getStudents();
        populateStudentSelect();
        
        // Load events
        currentEvents = await getAllEvents();
        calendar.refetchEvents();
        
        // Update upcoming classes
        updateUpcomingClasses();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('error', 'Failed to load data');
    }
}

// Load Events for Calendar
async function loadEvents(fetchInfo, successCallback, failureCallback) {
    try {
        const result = await api.getCalendarEvents({
            start_date: fetchInfo.startStr,
            end_date: fetchInfo.endStr
        });
        
        if (result.success) {
            const events = result.events.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                extendedProps: {
                    subject: event.subject,
                    teacher: event.teacher_id,
                    type: event.type,
                    location: event.location,
                    students: event.students,
                    description: event.description,
                    materials: event.materials
                },
                backgroundColor: getSubjectColor(event.subject),
                borderColor: getSubjectColor(event.subject)
            }));
            
            successCallback(events);
        } else {
            failureCallback(result.error);
        }
    } catch (error) {
        failureCallback(error);
    }
}

// CRUD Operations
async function getAllEvents() {
    // Mock data - Replace with actual API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    title: 'Mathematics Form 4',
                    subject: 'mathematics',
                    teacher: 'teacher1',
                    type: 'online',
                    start: '2024-01-15T14:00:00',
                    end: '2024-01-15T16:00:00',
                    location: {
                        link: 'https://zoom.us/j/123456789',
                        id: '123456789',
                        password: 'math123'
                    },
                    students: ['student1', 'student2', 'student3'],
                    maxStudents: 10,
                    description: 'Chapter 5: Trigonometry',
                    materials: 'Textbook, Calculator',
                    recurring: false
                },
                {
                    id: '2',
                    title: 'Science Form 3',
                    subject: 'science',
                    teacher: 'teacher2',
                    type: 'offline',
                    start: '2024-01-16T15:00:00',
                    end: '2024-01-16T17:00:00',
                    location: {
                        venue: 'Room 201',
                        address: 'Main Campus, Kuala Lumpur'
                    },
                    students: ['student4', 'student5'],
                    maxStudents: 15,
                    description: 'Chapter 3: Cells',
                    materials: 'Lab coat, Notebook',
                    recurring: true,
                    recurringDays: [2, 4] // Tuesday, Thursday
                }
            ]);
        }, 500);
    });
}

async function getEventById(id) {
    return currentEvents.find(event => event.id === id);
}

async function createEvent(eventData) {
    try {
        // Check for conflicts first
        const conflicts = await api.checkScheduleConflicts({
            start: eventData.start,
            end: eventData.end,
            teacher_id: eventData.teacher,
            students: eventData.students,
            event_id: eventData.id
        });
        
        if (conflicts.hasConflicts) {
            throw new Error('Schedule conflict detected');
        }
        
        const result = await api.createCalendarEvent(eventData);
        return result;
        
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
}


async function updateEvent(id, eventData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = currentEvents.findIndex(e => e.id === id);
            if (index !== -1) {
                currentEvents[index] = { ...currentEvents[index], ...eventData };
                logToSheet('info', `Event updated: ${id}`, 'Calendar');
                resolve(currentEvents[index]);
            }
            resolve(null);
        }, 500);
    });
}

async function deleteEvent(id, deleteAll = false) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (deleteAll) {
                // Delete all recurring events with same series ID
                currentEvents = currentEvents.filter(e => e.seriesId !== id);
            } else {
                currentEvents = currentEvents.filter(e => e.id !== id);
            }
            logToSheet('info', `Event deleted: ${id}`, 'Calendar');
            resolve(true);
        }, 500);
    });
}

// Modal Functions
function openEventModal(startDate = null, endDate = null) {
    document.getElementById('eventModal').classList.add('active');
    document.getElementById('modalTitle').innerHTML = __('calendar.modal.add');
    
    // Reset form
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    
    // Set dates if provided
    if (startDate) {
        const start = new Date(startDate);
        document.getElementById('eventStartDate').value = start.toISOString().split('T')[0];
        document.getElementById('eventStartTime').value = start.toTimeString().slice(0, 5);
    }
    
    if (endDate) {
        const end = new Date(endDate);
        document.getElementById('eventEndDate').value = end.toISOString().split('T')[0];
        document.getElementById('eventEndTime').value = end.toTimeString().slice(0, 5);
    }
    
    // Set default dates
    if (!startDate) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventStartDate').value = today;
        document.getElementById('eventEndDate').value = today;
    }
    
    // Initialize location field
    toggleLocationField();
    
    // Log opening
    logToSheet('info', 'Event modal opened', 'Calendar');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
    document.getElementById('eventForm').reset();
}

async function saveEvent() {
    // Validate form
    if (!validateEventForm()) {
        return;
    }
    
    // Gather form data
    const eventData = {
        title: document.getElementById('eventTitle').value,
        subject: document.getElementById('eventSubject').value,
        teacher: document.getElementById('eventTeacher').value,
        type: document.getElementById('eventType').value,
        start: `${document.getElementById('eventStartDate').value}T${document.getElementById('eventStartTime').value}`,
        end: `${document.getElementById('eventEndDate').value}T${document.getElementById('eventEndTime').value}`,
        location: getLocationData(),
        students: $('#eventStudents').val() || [],
        maxStudents: document.getElementById('eventMaxStudents').value,
        description: document.getElementById('eventDescription').value,
        materials: document.getElementById('eventMaterials').value,
        recurring: document.getElementById('eventRepeat').checked,
        notify: document.getElementById('eventNotify').checked
    };
    
    // Handle recurring events
    if (eventData.recurring) {
        eventData.repeatUntil = document.getElementById('eventRepeatUntil').value;
        eventData.repeatDays = getSelectedRepeatDays();
    }
    
    try {
        const eventId = document.getElementById('eventId').value;
        
        if (eventId) {
            // Update existing event
            await updateEvent(eventId, eventData);
            showNotification('success', 'Event updated successfully');
        } else {
            // Create new event
            await createEvent(eventData);
            showNotification('success', 'Event created successfully');
        }
        
        // Refresh calendar
        calendar.refetchEvents();
        updateUpcomingClasses();
        closeEventModal();
        
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('error', 'Failed to save event');
    }
}

function validateEventForm() {
    const required = ['eventTitle', 'eventSubject', 'eventTeacher', 'eventStartDate', 'eventEndDate', 'eventStartTime', 'eventEndTime'];
    let isValid = true;
    
    required.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value) {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });
    
    // Validate end date >= start date
    const startDate = new Date(document.getElementById('eventStartDate').value);
    const endDate = new Date(document.getElementById('eventEndDate').value);
    
    if (endDate < startDate) {
        showNotification('error', 'End date must be after start date');
        isValid = false;
    }
    
    // Validate end time > start time for same day
    if (startDate.toDateString() === endDate.toDateString()) {
        const startTime = document.getElementById('eventStartTime').value;
        const endTime = document.getElementById('eventEndTime').value;
        
        if (endTime <= startTime) {
            showNotification('error', 'End time must be after start time');
            isValid = false;
        }
    }
    
    return isValid;
}

function getLocationData() {
    const type = document.getElementById('eventType').value;
    
    if (type === 'online') {
        return {
            link: document.getElementById('eventMeetingLink').value,
            meetingId: document.getElementById('eventMeetingId').value,
            password: document.getElementById('eventPassword').value
        };
    } else {
        return {
            venue: document.getElementById('eventVenue').value,
            address: document.getElementById('eventAddress').value
        };
    }
}

function getSelectedRepeatDays() {
    const checkboxes = document.querySelectorAll('input[name="repeat_days"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// Event Details Modal
async function showEventDetails(event) {
    const eventData = await getEventById(event.id);
    
    if (!eventData) return;
    
    const detailsHtml = `
        <div class="event-detail-item">
            <span class="event-detail-label">Title:</span>
            <span class="event-detail-value">${eventData.title}</span>
        </div>
        <div class="event-detail-item">
            <span class="event-detail-label">Subject:</span>
            <span class="event-detail-value">${__(`subjects.${eventData.subject}`)}</span>
        </div>
        <div class="event-detail-item">
            <span class="event-detail-label">Teacher:</span>
            <span class="event-detail-value">${getTeacherName(eventData.teacher)}</span>
        </div>
        <div class="event-detail-item">
            <span class="event-detail-label">Type:</span>
            <span class="event-detail-value ${eventData.type}">${__(`calendar.type.${eventData.type}`)}</span>
        </div>
        <div class="event-detail-item">
            <span class="event-detail-label">Date & Time:</span>
            <span class="event-detail-value">${formatDateTime(eventData.start)} - ${formatDateTime(eventData.end)}</span>
        </div>
        <div class="event-detail-item">
            <span class="event-detail-label">Location:</span>
            <span class="event-detail-value">${formatLocation(eventData.location, eventData.type)}</span>
        </div>
        <div class="event-detail-item">
            <span class="event-detail-label">Students:</span>
            <div class="event-detail-value">
                <ul class="participant-list">
                    ${formatStudentList(eventData.students)}
                </ul>
                <small>Max: ${eventData.maxStudents} students</small>
            </div>
        </div>
        ${eventData.description ? `
        <div class="event-detail-item">
            <span class="event-detail-label">Description:</span>
            <span class="event-detail-value">${eventData.description}</span>
        </div>
        ` : ''}
        ${eventData.materials ? `
        <div class="event-detail-item">
            <span class="event-detail-label">Materials:</span>
            <span class="event-detail-value">${eventData.materials}</span>
        </div>
        ` : ''}
    `;
    
    document.getElementById('eventDetails').innerHTML = detailsHtml;
    document.getElementById('detailsModal').classList.add('active');
    currentEventId = event.id;
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.remove('active');
    currentEventId = null;
}

function editFromDetails() {
    closeDetailsModal();
    editEvent(currentEventId);
}

async function editEvent(eventId) {
    const eventData = await getEventById(eventId);
    
    if (!eventData) return;
    
    openEventModal();
    document.getElementById('modalTitle').innerHTML = __('calendar.modal.edit');
    document.getElementById('eventId').value = eventData.id;
    
    // Populate form
    document.getElementById('eventTitle').value = eventData.title;
    document.getElementById('eventSubject').value = eventData.subject;
    document.getElementById('eventTeacher').value = eventData.teacher;
    document.getElementById('eventType').value = eventData.type;
    
    const start = new Date(eventData.start);
    document.getElementById('eventStartDate').value = start.toISOString().split('T')[0];
    document.getElementById('eventStartTime').value = start.toTimeString().slice(0, 5);
    
    const end = new Date(eventData.end);
    document.getElementById('eventEndDate').value = end.toISOString().split('T')[0];
    document.getElementById('eventEndTime').value = end.toTimeString().slice(0, 5);
    
    // Populate location
    if (eventData.type === 'online') {
        document.getElementById('eventMeetingLink').value = eventData.location.link || '';
        document.getElementById('eventMeetingId').value = eventData.location.meetingId || '';
        document.getElementById('eventPassword').value = eventData.location.password || '';
    } else {
        document.getElementById('eventVenue').value = eventData.location.venue || '';
        document.getElementById('eventAddress').value = eventData.location.address || '';
    }
    
    // Populate students
    $('#eventStudents').val(eventData.students || []).trigger('change');
    document.getElementById('eventMaxStudents').value = eventData.maxStudents;
    document.getElementById('eventDescription').value = eventData.description || '';
    document.getElementById('eventMaterials').value = eventData.materials || '';
    
    toggleLocationField();
}

function deleteFromDetails() {
    closeDetailsModal();
    openDeleteModal(currentEventId);
}

function openDeleteModal(eventId) {
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('deleteEventInfo').innerHTML = `
        <strong>${event.title}</strong><br>
        ${formatDateTime(event.start)}
    `;
    
    document.getElementById('deleteModal').classList.add('active');
    currentDeleteId = eventId;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeleteId = null;
}

async function confirmDelete() {
    const deleteAll = document.getElementById('deleteAllOccurrences').checked;
    
    try {
        await deleteEvent(currentDeleteId, deleteAll);
        calendar.refetchEvents();
        updateUpcomingClasses();
        showNotification('success', 'Event deleted successfully');
        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('error', 'Failed to delete event');
    }
}

// Helper Functions
function toggleLocationField() {
    const type = document.getElementById('eventType').value;
    
    if (type === 'online') {
        document.getElementById('onlineLocation').style.display = 'block';
        document.getElementById('offlineLocation').style.display = 'none';
    } else {
        document.getElementById('onlineLocation').style.display = 'none';
        document.getElementById('offlineLocation').style.display = 'block';
    }
}

function toggleRepeatOptions() {
    const repeat = document.getElementById('eventRepeat').checked;
    document.getElementById('repeatDetails').style.display = repeat ? 'block' : 'none';
}

function getSubjectColor(subject) {
    const colors = {
        mathematics: '#4a6bff',
        science: '#10b981',
        english: '#f59e0b',
        malay: '#8b5cf6',
        mandarin: '#ec4899',
        history: '#6b7280',
        physics: '#3b82f6',
        chemistry: '#14b8a6',
        biology: '#84cc16',
        accounting: '#dc2626'
    };
    
    return colors[subject] || '#4a6bff';
}

function getTeacherName(teacherId) {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : teacherId;
}

function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatLocation(location, type) {
    if (type === 'online') {
        return location.link ? 
            `<a href="${location.link}" target="_blank">Join Meeting</a>` : 
            'Link not provided';
    } else {
        return `${location.venue || 'Venue TBD'}, ${location.address || ''}`;
    }
}

function formatStudentList(studentIds) {
    if (!studentIds || studentIds.length === 0) {
        return '<li>No students enrolled yet</li>';
    }
    
    return studentIds.map(id => {
        const student = students.find(s => s.id === id);
        return `<li>${student ? student.name : id}</li>`;
    }).join('');
}

function updateUpcomingClasses() {
    const now = new Date();
    const upcoming = currentEvents
        .filter(e => new Date(e.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5);
    
    const list = document.getElementById('upcomingList');
    
    if (upcoming.length === 0) {
        list.innerHTML = '<p class="text-center text-gray">No upcoming classes</p>';
        return;
    }
    
    list.innerHTML = upcoming.map(event => `
        <div class="upcoming-item" onclick="showEventDetails({id: '${event.id}'})">
            <div class="upcoming-time">
                <i class="far fa-calendar"></i> ${formatDateTime(event.start)}
            </div>
            <div class="upcoming-title">${event.title}</div>
            <div class="upcoming-details">
                <span><i class="fas fa-chalkboard-teacher"></i> ${getTeacherName(event.teacher)}</span>
                <span><i class="fas ${event.type === 'online' ? 'fa-video' : 'fa-building'}"></i> 
                    ${__(`calendar.type.${event.type}`)}</span>
            </div>
        </div>
    `).join('');
}

// Filter Functions
function filterEvents() {
    const teacher = document.getElementById('teacherFilter').value;
    const subject = document.getElementById('subjectFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    calendar.getEvents().forEach(event => {
        let show = true;
        
        if (teacher !== 'all' && event.extendedProps.teacher !== teacher) {
            show = false;
        }
        
        if (subject !== 'all' && event.extendedProps.subject !== subject) {
            show = false;
        }
        
        if (type !== 'all' && event.extendedProps.type !== type) {
            show = false;
        }
        
        event.setProp('display', show ? 'auto' : 'none');
    });
}

function resetFilters() {
    document.getElementById('teacherFilter').value = 'all';
    document.getElementById('subjectFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';
    
    calendar.getEvents().forEach(event => {
        event.setProp('display', 'auto');
    });
}

function changeView(view) {
    calendar.changeView(view);
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Update Event Functions
async function updateEventDate(event) {
    const eventData = await getEventById(event.id);
    
    if (eventData) {
        eventData.start = event.start.toISOString();
        eventData.end = event.end.toISOString();
        await updateEvent(event.id, eventData);
        showNotification('success', 'Event date updated');
    }
}

async function updateEventDuration(event) {
    const eventData = await getEventById(event.id);
    
    if (eventData) {
        eventData.end = event.end.toISOString();
        await updateEvent(event.id, eventData);
        showNotification('success', 'Event duration updated');
    }
}

async function getTeachers() {
    try {
        const result = await api.getTeachers();
        return result.teachers || [];
    } catch (error) {
        console.error('Error loading teachers:', error);
        return [];
    }
}

async function getStudents() {
    try {
        const result = await api.getStudents();
        return result.students || [];
    } catch (error) {
        console.error('Error loading students:', error);
        return [];
    }
}

// Populate Teacher Filter
function populateTeacherFilter() {
    const select = document.getElementById('teacherFilter');
    
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        select.appendChild(option);
    });
}

// Populate Student Select (Select2)
function initializeSelect2() {
    $('#eventStudents').select2({
        placeholder: 'Select students',
        allowClear: true,
        width: '100%',
        data: students.map(s => ({ id: s.id, text: s.name }))
    });
}

function populateStudentSelect() {
    const select = document.getElementById('eventStudents');
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        select.appendChild(option);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Date validation
    document.getElementById('eventStartDate').addEventListener('change', validateDates);
    document.getElementById('eventEndDate').addEventListener('change', validateDates);
    
    // Time validation
    document.getElementById('eventStartTime').addEventListener('change', validateTimes);
    document.getElementById('eventEndTime').addEventListener('change', validateTimes);
    
    // Form submit on Enter
    document.getElementById('eventForm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEvent();
        }
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Click outside to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Validation Functions
function validateDates() {
    const startDate = new Date(document.getElementById('eventStartDate').value);
    const endDate = new Date(document.getElementById('eventEndDate').value);
    
    if (endDate < startDate) {
        document.getElementById('eventEndDate').classList.add('error');
        showNotification('warning', 'End date cannot be before start date');
    } else {
        document.getElementById('eventEndDate').classList.remove('error');
    }
}

function validateTimes() {
    const startDate = document.getElementById('eventStartDate').value;
    const endDate = document.getElementById('eventEndDate').value;
    
    if (startDate === endDate) {
        const startTime = document.getElementById('eventStartTime').value;
        const endTime = document.getElementById('eventEndTime').value;
        
        if (endTime <= startTime) {
            document.getElementById('eventEndTime').classList.add('error');
            showNotification('warning', 'End time must be after start time');
        } else {
            document.getElementById('eventEndTime').classList.remove('error');
        }
    }
}

// Notification System
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `admin-notification-toast notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Close all modals
function closeAllModals() {
    closeEventModal();
    closeDetailsModal();
    closeDeleteModal();
}

// Print calendar
function printCalendar() {
    window.print();
}

// Export calendar data
function exportCalendar(format = 'ics') {
    const events = currentEvents.map(event => ({
        uid: event.id,
        start: event.start,
        end: event.end,
        title: event.title,
        description: event.description,
        location: event.type === 'online' ? event.location.link : `${event.location.venue}, ${event.location.address}`
    }));
    
    if (format === 'ics') {
        // Generate ICS file
        let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EduSmart//Calendar//EN\n';
        
        events.forEach(event => {
            icsContent += 'BEGIN:VEVENT\n';
            icsContent += `UID:${event.uid}\n`;
            icsContent += `DTSTART:${formatDateForICS(event.start)}\n`;
            icsContent += `DTEND:${formatDateForICS(event.end)}\n`;
            icsContent += `SUMMARY:${event.title}\n`;
            if (event.description) icsContent += `DESCRIPTION:${event.description}\n`;
            if (event.location) icsContent += `LOCATION:${event.location}\n`;
            icsContent += 'END:VEVENT\n';
        });
        
        icsContent += 'END:VCALENDAR';
        
        // Download file
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tuition_schedule.ics';
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification('success', 'Calendar exported successfully');
    }
}

function formatDateForICS(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Import calendar data
function importCalendar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ics,.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(readerEvent) {
            try {
                // Parse based on file type
                if (file.name.endsWith('.json')) {
                    const events = JSON.parse(readerEvent.target.result);
                    // Process JSON events
                    importEvents(events);
                } else if (file.name.endsWith('.ics')) {
                    // Parse ICS (simplified)
                    const content = readerEvent.target.result;
                    // Process ICS events
                    showNotification('info', 'ICS import not fully implemented');
                }
            } catch (error) {
                showNotification('error', 'Failed to import file');
                console.error('Import error:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

async function importEvents(events) {
    let imported = 0;
    
    for (const event of events) {
        try {
            await createEvent(event);
            imported++;
        } catch (error) {
            console.error('Failed to import event:', error);
        }
    }
    
    calendar.refetchEvents();
    updateUpcomingClasses();
    showNotification('success', `Successfully imported ${imported} events`);
}

// Conflict Check
function checkConflicts(eventData) {
    const newStart = new Date(eventData.start);
    const newEnd = new Date(eventData.end);
    
    const conflicts = currentEvents.filter(existing => {
        if (existing.id === eventData.id) return false; // Skip self
        
        const existingStart = new Date(existing.start);
        const existingEnd = new Date(existing.end);
        
        // Check for overlap
        return (newStart < existingEnd && newEnd > existingStart);
    });
    
    return conflicts;
}

// Get events by date range
function getEventsByDateRange(startDate, endDate) {
    return currentEvents.filter(event => {
        const eventStart = new Date(event.start);
        return eventStart >= startDate && eventStart <= endDate;
    });
}

// Get events by teacher
function getEventsByTeacher(teacherId) {
    return currentEvents.filter(event => event.teacher === teacherId);
}

// Get events by student
function getEventsByStudent(studentId) {
    return currentEvents.filter(event => 
        event.students && event.students.includes(studentId)
    );
}

// Generate weekly schedule for a student
function generateStudentSchedule(studentId) {
    const studentEvents = getEventsByStudent(studentId);
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const schedule = {};
    weekDays.forEach(day => schedule[day] = []);
    
    studentEvents.forEach(event => {
        const date = new Date(event.start);
        const dayName = weekDays[date.getDay()];
        
        schedule[dayName].push({
            time: date.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
            subject: event.subject,
            teacher: getTeacherName(event.teacher),
            type: event.type,
            location: event.location
        });
    });
    
    return schedule;
}

// Send reminders
async function sendReminders(eventId) {
    const event = await getEventById(eventId);
    if (!event) return;
    
    const startTime = new Date(event.start);
    const now = new Date();
    const hoursUntil = (startTime - now) / (1000 * 60 * 60);
    
    if (hoursUntil <= 24 && hoursUntil > 0) {
        // Send reminders to students
        if (event.students && event.students.length > 0) {
            // Here you would integrate with email/SMS service
            console.log(`Sending reminders for event ${event.title} to ${event.students.length} students`);
            
            logToSheet('info', `Reminders sent for event: ${event.title}`, 'Calendar');
            showNotification('success', `Reminders sent to ${event.students.length} students`);
        }
    }
}

// Auto-reminder checker
function startReminderChecker() {
    setInterval(() => {
        currentEvents.forEach(event => {
            sendReminders(event.id);
        });
    }, 60 * 60 * 1000); // Check every hour
}

// Initialize auto-reminder
startReminderChecker();

// Export functions for use in HTML
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.saveEvent = saveEvent;
window.showEventDetails = showEventDetails;
window.closeDetailsModal = closeDetailsModal;
window.editFromDetails = editFromDetails;
window.deleteFromDetails = deleteFromDetails;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.filterEvents = filterEvents;
window.resetFilters = resetFilters;
window.changeView = changeView;
window.toggleLocationField = toggleLocationField;
window.toggleRepeatOptions = toggleRepeatOptions;
window.printCalendar = printCalendar;
window.exportCalendar = exportCalendar;
window.importCalendar = importCalendar;

// Log calendar initialization

logToSheet('info', 'Calendar module initialized', 'Calendar');		

