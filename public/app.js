const timeline = document.getElementById("recordsTimeline");
const recordCount = document.getElementById("recordCount");
const doctorSearch = document.getElementById("doctorSearch");
const openRecordModalButton = document.getElementById("openRecordModal");
const openDoctorModalButton = document.getElementById("openDoctorModal");
const recordModal = document.getElementById("recordModal");
const doctorModal = document.getElementById("doctorModal");
const recordForm = document.getElementById("recordForm");
const doctorForm = document.getElementById("doctorForm");
const recordDoctorSelect = document.getElementById("recordDoctorSelect");
const recordFormMessage = document.getElementById("recordFormMessage");
const doctorFormMessage = document.getElementById("doctorFormMessage");

let doctorsCache = [];

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderEmptyState = () => {
  timeline.innerHTML = `
    <div class="empty-state">
      No medical records found.
    </div>
  `;
  recordCount.textContent = "0 records";
};

const renderErrorState = () => {
  timeline.innerHTML = `
    <div class="error-state">
      Unable to load records right now.
    </div>
  `;
  recordCount.textContent = "Error";
};

const renderRecords = (records) => {
  if (!records.length) {
    renderEmptyState();
    return;
  }

  recordCount.textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;
  timeline.innerHTML = records
    .map((record) => {
      const doctorName = record.doctor_name || "No doctor assigned";

      return `
        <div class="timeline-item">
          <div class="timeline-date">${formatDate(record.record_date)}</div>
          <div>
            <p class="timeline-title">${escapeHtml(record.title)}</p>
            <p class="timeline-doctor">${escapeHtml(doctorName)}</p>
          </div>
          <button class="view-button" type="button" data-record-id="${record.id}">View</button>
        </div>
      `;
    })
    .join("");
};

const populateDoctorSearch = (doctors) => {
  if (!doctors.length) {
    doctorSearch.setAttribute("placeholder", "Search doctor");
    return;
  }

  doctorSearch.setAttribute(
    "placeholder",
    doctors.map((doctor) => doctor.name).slice(0, 2).join(", ")
  );
};

const populateDoctorDropdown = (doctors) => {
  recordDoctorSelect.innerHTML = `
    <option value="">No doctor assigned</option>
    ${doctors
      .map(
        (doctor) =>
          `<option value="${doctor.id}">${escapeHtml(doctor.name)}</option>`
      )
      .join("")}
  `;
};

const fetchDoctors = async () => {
  const response = await fetch("/api/doctors");

  if (!response.ok) {
    throw new Error("Failed to fetch doctors.");
  }

  doctorsCache = await response.json();
  populateDoctorSearch(doctorsCache);
  populateDoctorDropdown(doctorsCache);
  return doctorsCache;
};

const fetchRecords = async () => {
  const params = new URLSearchParams();
  const startDate = document.querySelector('input[name="start_date"]').value;
  const endDate = document.querySelector('input[name="end_date"]').value;
  const category = document.querySelector('input[name="category"]').value.trim();
  const doctorName = document.querySelector('input[name="doctor_name"]').value.trim();

  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (category) params.append('category', category);

  if (doctorName && doctorsCache.length) {
    const match = doctorsCache.find(d => d.name.toLowerCase().includes(doctorName.toLowerCase()));
    if (match) params.append('doctor_id', match.id);
  }

  const url = '/api/records' + (params.toString() ? `?${params.toString()}` : '');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch medical records.');
  }
  return response.json();
};

const refreshTimeline = async () => {
  const records = await fetchRecords();
  renderRecords(records);
};

const loadDashboardData = async () => {
  try {
    const [doctors, records] = await Promise.all([
      fetchDoctors(),
      fetchRecords()
    ]);

    populateDoctorSearch(doctors);
    populateDoctorDropdown(doctors);
    renderRecords(records);
  } catch (error) {
    renderErrorState();
  }
};

const openModal = (modal) => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeModal = (modal) => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  if (!document.querySelector(".modal-overlay.is-open")) {
    document.body.classList.remove("modal-open");
  }
};

const getFormData = (form) => Object.fromEntries(new FormData(form).entries());

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
};

const handleDoctorSubmit = async (event) => {
  event.preventDefault();
  doctorFormMessage.textContent = "";

  const formData = getFormData(doctorForm);
  const payload = {
    name: formData.name.trim(),
    specialty: formData.specialty.trim(),
    clinic_name: formData.clinic_name.trim(),
    phone_number: "",
    email: ""
  };

  try {
    await postJson("/api/doctors", payload);
    doctorForm.reset();
    closeModal(doctorModal);
    await fetchDoctors();
    await refreshTimeline();
  } catch (error) {
    doctorFormMessage.textContent = error.message;
  }
};

const handleRecordSubmit = async (event) => {
  event.preventDefault();
  recordFormMessage.textContent = "";

  const formData = getFormData(recordForm);
  const payload = {
    doctor_id: formData.doctor_id ? Number(formData.doctor_id) : null,
    title: formData.title.trim(),
    category: formData.category,
    record_date: formData.record_date,
    notes: formData.notes.trim()
  };

  try {
    await postJson("/api/records", payload);
    recordForm.reset();
    closeModal(recordModal);
    await refreshTimeline();
  } catch (error) {
    recordFormMessage.textContent = error.message;
  }
};

const wireModalEvents = () => {
  openRecordModalButton.addEventListener("click", () => openModal(recordModal));
  openDoctorModalButton.addEventListener("click", () => openModal(doctorModal));

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(document.getElementById(button.dataset.closeModal));
    });
  });

  [recordModal, doctorModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal(recordModal);
      closeModal(doctorModal);
    }
  });

  doctorForm.addEventListener("submit", handleDoctorSubmit);
  recordForm.addEventListener("submit", handleRecordSubmit);
};

document.addEventListener("DOMContentLoaded", () => {
  wireModalEvents();
  loadDashboardData();
});
