const timeline = document.getElementById("recordsTimeline");
const recordCount = document.getElementById("recordCount");
const doctorSearch = document.getElementById("doctorSearch");

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
    return;
  }

  doctorSearch.setAttribute(
    "placeholder",
    doctors.map((doctor) => doctor.name).slice(0, 2).join(", ")
  );
};

const loadDashboardData = async () => {
  try {
    const [doctorsResponse, recordsResponse] = await Promise.all([
      fetch("/api/doctors"),
      fetch("/api/records")
    ]);

    if (!doctorsResponse.ok || !recordsResponse.ok) {
      throw new Error("Dashboard API request failed.");
    }

    const [doctors, records] = await Promise.all([
      doctorsResponse.json(),
      recordsResponse.json()
    ]);

    populateDoctorSearch(doctors);
    renderRecords(records);
  } catch (error) {
    renderErrorState();
  }
};

document.addEventListener("DOMContentLoaded", loadDashboardData);
