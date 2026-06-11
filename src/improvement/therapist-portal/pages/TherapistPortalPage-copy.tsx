import React, { useState } from "react";
import styles from "./TherapistPortalPage.module.css";
import { useSTDashboard } from "@/shared/hooks/useSTDashboard";
import TherapistCalibrationSection from "@/improvement/therapist-portal/components/TherapistCalibrationSection";

function ExportStudentListCSV() {
  const { students } = useSTDashboard();
  const handleExport = () => {
    const headers = ["Nickname", "Age", "Total XP", "Lessons", "Accuracy", "Last Active"];
    const rows = students.map(s => [s.nickname, s.age ?? "", s.total_xp, s.completed_lessons, s.accuracy_avg, s.last_active ?? ""]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={handleExport} className={styles.exportBtn}>Export CSV</button>;
}

function ExportProgressCSV() {
  return <button className={styles.exportBtn}>Export CSV</button>;
}

function StudentList({ students, loading, removing, handleRemove }) {
  return (
    <table className={styles.portalTable}>
      <thead>
        <tr className={styles.headerRow}>
          <th>Nickname</th>
          <th>Age</th>
          <th>Total XP</th>
          <th>Lessons</th>
          <th>Accuracy</th>
          <th>Last Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr className={styles.loadingRow}><td colSpan={7}>Loading...</td></tr>
        ) : students.length === 0 ? (
          <tr className={styles.emptyRow}><td colSpan={7}>No students found.</td></tr>
        ) : (
          students.map(s => (
            <tr key={s.student_id} className={styles.dataRow}>
              <td>{s.nickname}</td>
              <td>{s.age ?? "-"}</td>
              <td>{s.total_xp}</td>
              <td>{s.completed_lessons}</td>
              <td>{s.accuracy_avg ? s.accuracy_avg + "%" : "-"}</td>
              <td>{s.last_active ? new Date(s.last_active).toLocaleDateString() : "-"}</td>
              <td>
                <button
                  onClick={() => handleRemove(s.student_id)}
                  disabled={removing === s.student_id}
                  className={styles.removeBtn}
                >
                  {removing === s.student_id ? "Removing..." : "Remove"}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function StudentProgressAnalyticsPanel({ students }) {
  return (
    <div className={styles.analyticsPanelContent}>
      <p>Analytics coming soon. {students.length} students loaded.</p>
    </div>
  );
}

export default function TherapistPortalPage() {
  const { students: allStudents = [], refresh } = useSTDashboard();
  const [addUsername, setAddUsername] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = allStudents.filter(s =>
    s.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (event) => {
    event.preventDefault();
    setStatus(null);
    if (!addUsername.trim()) {
      setStatus("Please enter a username.");
      return;
    }
    setLoading(true);
    // TODO: Add student logic
    setStatus("Student added!");
    setAddUsername("");
    setLoading(false);
    refresh && refresh();
  };

  const handleRemove = async (student_id) => {
    setRemoving(student_id);
    // TODO: Remove student logic
    setRemoving(null);
    setStatus("Student removed!");
    refresh && refresh();
  };

  return (
    <div className={styles.portalRoot}>
      <h1 className={styles.portalTitle}>Therapist Portal</h1>
      <p className={styles.portalDesc}>Manage students, assign practice, unlock missions, and access voice cloning/calibration tools here.</p>

      <div className={styles.sectionMargin}>
        <TherapistCalibrationSection />
      </div>

      <div className={styles.flexWrap}>
        {/* Student List Section */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Student List</h2>
            <ExportStudentListCSV />
          </div>
          <form onSubmit={handleAdd} className={styles.addForm}>
            <input
              type="text"
              placeholder="Add student by username"
              value={addUsername}
              onChange={e => setAddUsername(e.target.value)}
              className={styles.addInput}
            />
            <button type="submit" className={styles.addBtn} disabled={loading}>Add</button>
            {status && (
              <span className={styles.statusMsg + " " + (status === "Student added!" ? styles.statusSuccess : styles.statusError)}>{status}</span>
            )}
          </form>
          <input
            type="text"
            placeholder="Search by nickname"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <StudentList students={filtered} loading={loading} removing={removing} handleRemove={handleRemove} />
        </section>
        {/* Additional panels (AssignmentsPanel, MissionUnlockPanel, etc.) can be added here as needed */}
        <section className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Student Progress Analytics</h2>
            <ExportProgressCSV />
          </div>
          <StudentProgressAnalyticsPanel students={filtered} />
        </section>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import styles from "./TherapistPortalPage.module.css";
import { useSTDashboard } from "@/shared/hooks/useSTDashboard";
import TherapistCalibrationSection from "@/improvement/therapist-portal/components/TherapistCalibrationSection";

function ExportStudentListCSV() {
  const handleExport = () => {
    const headers = ["Nickname", "Age", "Total XP", "Lessons", "Accuracy", "Last Active"];
    const rows = students.map(s => [s.nickname, s.age ?? "", s.total_xp, s.completed_lessons, s.accuracy_avg, s.last_active ?? ""]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return <button onClick={handleExport} className={styles.exportBtn}>Export CSV</button>;
}

function ExportProgressCSV() {
  return <button className={styles.exportBtn}>Export CSV</button>;
}

function StudentList({ students, loading, removing, handleRemove }) {
  return (
    <table className={styles.portalTable}>
      <thead>
        <tr className={styles.headerRow}>
          <th>Nickname</th>
          <th>Age</th>
          <th>Total XP</th>
          <th>Lessons</th>
          <th>Accuracy</th>
          <th>Last Active</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr className={styles.loadingRow}><td colSpan={7}>Loading...</td></tr>
        ) : students.length === 0 ? (
          <tr className={styles.emptyRow}><td colSpan={7}>No students found.</td></tr>
        ) : (
          students.map(s => (
            <tr key={s.student_id} className={styles.dataRow}>
              <td>{s.nickname}</td>
              <td>{s.age ?? "-"}</td>
              <td>{s.total_xp}</td>
              <td>{s.completed_lessons}</td>
              <td>{s.accuracy_avg ? s.accuracy_avg + "%" : "-"}</td>
              <td>{s.last_active ? new Date(s.last_active).toLocaleDateString() : "-"}</td>
              <td>
                <button
                  onClick={() => handleRemove(s.student_id)}
                  disabled={removing === s.student_id}
                  className={styles.removeBtn}
                >
                  {removing === s.student_id ? "Removing..." : "Remove"}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function StudentProgressAnalyticsPanel({ students }) {
  return (
    <div className={styles.analyticsPanelContent}>
      <p>Analytics coming soon. {students.length} students loaded.</p>
    </div>
  );
}
export default function TherapistPortalPage() {
  const { students: allStudents = [], refresh } = useSTDashboard();
  const [addUsername, setAddUsername] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = allStudents.filter(s =>
    s.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (event) => {
  event.preventDefault();
  setStatus(null);
  if (!addUsername.trim()) {
      setStatus("Please enter a username.");
      return;
    }
  setLoading(true);
  // TODO: Add student logic
  setStatus("Student added!");
  setAddUsername("");
  setLoading(false);
  refresh && refresh();
  };

  const handleRemove = async (student_id) => {
  setRemoving(student_id);
  // TODO: Remove student logic
  setRemoving(null);
    setStatus("Student removed!");
    refresh && refresh();
  };

  return (
    <div className={styles.portalRoot}>
  <h1 className={styles.portalTitle}>Therapist Portal</h1>
  <p className={styles.portalDesc}>Manage students, assign practice, unlock missions, and access voice cloning/calibration tools here.</p>

      <div className={styles.sectionMargin}>
        <TherapistCalibrationSection />
      </div>

      <div className={styles.flexWrap}>
        {/* Student List Section */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Student List</h2>
            <ExportStudentListCSV />
          </div>
          <form onSubmit={handleAdd} className={styles.addForm}>
            <input
              type="text"
              placeholder="Add student by username"
              value={addUsername}
              onChange={e => setAddUsername(e.target.value)}
              className={styles.addInput}
            />
            <button type="submit" className={styles.addBtn} disabled={loading}>Add</button>
            {status && (
              <span className={styles.statusMsg + " " + (status === "Student added!" ? styles.statusSuccess : styles.statusError)}>{status}</span>
            )}
          </form>
          <input
            type="text"
            placeholder="Search by nickname"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <StudentList students={filtered} loading={loading} removing={removing} handleRemove={handleRemove} />
        </section>
        {/* Additional panels (AssignmentsPanel, MissionUnlockPanel, etc.) can be added here as needed */}
        <section className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Student Progress Analytics</h2>
            <ExportProgressCSV />
          </div>
          <StudentProgressAnalyticsPanel students={filtered} />
        </section>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import styles from "./TherapistPortalPage.module.css";
import { useSTDashboard } from "@/shared/hooks/useSTDashboard";
import TherapistCalibrationSection from "@/improvement/therapist-portal/components/TherapistCalibrationSection";

function ExportStudentListCSV() {
  const { students } = useSTDashboard();
  const handleExport = () => {
    const headers = ["Nickname", "Age", "Total XP", "Lessons", "Accuracy", "Last Active"];
    const rows = students.map(s => [s.nickname, s.age ?? "", s.total_xp, s.completed_lessons, s.accuracy_avg, s.last_active ?? ""]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    </div>
  );
      <tbody>
        {loading ? (

          import React, { useState } from "react";
          import styles from "./TherapistPortalPage.module.css";
          import { useSTDashboard } from "@/shared/hooks/useSTDashboard";
          import TherapistCalibrationSection from "@/improvement/therapist-portal/components/TherapistCalibrationSection";

          function ExportStudentListCSV() {
            const { students } = useSTDashboard();
            const handleExport = () => {
              const headers = ["Nickname", "Age", "Total XP", "Lessons", "Accuracy", "Last Active"];
              const rows = students.map(s => [s.nickname, s.age ?? "", s.total_xp, s.completed_lessons, s.accuracy_avg, s.last_active ?? ""]);
              const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "students.csv";
              a.click();
              URL.revokeObjectURL(url);
            };
            return <button onClick={handleExport} className={styles.exportBtn}>Export CSV</button>;
          }

          function ExportProgressCSV() {
            return <button className={styles.exportBtn}>Export CSV</button>;
          }

          function StudentList({ students, loading, removing, handleRemove }) {
            return (
              <table className={styles.portalTable}>
                <thead>
                  <tr className={styles.headerRow}>
                    <th>Nickname</th>
                    <th>Age</th>
                    <th>Total XP</th>
                    <th>Lessons</th>
                    <th>Accuracy</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className={styles.loadingRow}><td colSpan={7}>Loading...</td></tr>
                  ) : students.length === 0 ? (
                    <tr className={styles.emptyRow}><td colSpan={7}>No students found.</td></tr>
                  ) : (
                    students.map(s => (
                      <tr key={s.student_id} className={styles.dataRow}>
                        <td>{s.nickname}</td>
                        <td>{s.age ?? "-"}</td>
                        <td>{s.total_xp}</td>
                        <td>{s.completed_lessons}</td>
                        <td>{s.accuracy_avg ? s.accuracy_avg + "%" : "-"}</td>
                        <td>{s.last_active ? new Date(s.last_active).toLocaleDateString() : "-"}</td>
                        <td>
                          <button
                            onClick={() => handleRemove(s.student_id)}
                            disabled={removing === s.student_id}
                            className={styles.removeBtn}
                          >
                            {removing === s.student_id ? "Removing..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            );
          }

          function StudentProgressAnalyticsPanel({ students }) {
            return (
              <div className={styles.analyticsPanelContent}>
                <p>Analytics coming soon. {students.length} students loaded.</p>
              </div>
            );
          }

          export default function TherapistPortalPage() {
            const { students: allStudents = [], refresh } = useSTDashboard();
            const [addUsername, setAddUsername] = useState("");
            const [search, setSearch] = useState("");
            const [status, setStatus] = useState(null);
            const [removing, setRemoving] = useState(null);
            const [loading, setLoading] = useState(false);

            const filtered = allStudents.filter(s =>
              s.nickname?.toLowerCase().includes(search.toLowerCase())
            );

            const handleAdd = async (event) => {
              event.preventDefault();
              setStatus(null);
              if (!addUsername.trim()) {
                setStatus("Please enter a username.");
                return;
              }
              setLoading(true);
              // TODO: Add student logic
              setStatus("Student added!");
              setAddUsername("");
              setLoading(false);
              refresh && refresh();
            };

            const handleRemove = async (student_id) => {
              setRemoving(student_id);
              // TODO: Remove student logic
              setRemoving(null);
              setStatus("Student removed!");
              refresh && refresh();
            };

            return (
              <div className={styles.portalRoot}>
                <h1 className={styles.portalTitle}>Therapist Portal</h1>
                <p className={styles.portalDesc}>Manage students, assign practice, unlock missions, and access voice cloning/calibration tools here.</p>

                <div className={styles.sectionMargin}>
                  <TherapistCalibrationSection />
                </div>

                <div className={styles.flexWrap}>
                  {/* Student List Section */}
                  <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                      <h2 className={styles.panelTitle}>Student List</h2>
                      <ExportStudentListCSV />
                    </div>
                    <form onSubmit={handleAdd} className={styles.addForm}>
                      <input
                        type="text"
                        placeholder="Add student by username"
                        value={addUsername}
                        onChange={e => setAddUsername(e.target.value)}
                        className={styles.addInput}
                      />
                      <button type="submit" className={styles.addBtn} disabled={loading}>Add</button>
                      {status && (
                        <span className={styles.statusMsg + " " + (status === "Student added!" ? styles.statusSuccess : styles.statusError)}>{status}</span>
                      )}
                    </form>
                    <input
                      type="text"
                      placeholder="Search by nickname"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className={styles.searchInput}
                    />
                    <StudentList students={filtered} loading={loading} removing={removing} handleRemove={handleRemove} />
                  </section>
                  {/* Additional panels (AssignmentsPanel, MissionUnlockPanel, etc.) can be added here as needed */}
                  <section className={styles.analyticsPanel}>
                    <div className={styles.panelHeader}>
                      <h2 className={styles.panelTitle}>Student Progress Analytics</h2>
                      <ExportProgressCSV />
                    </div>
                    <StudentProgressAnalyticsPanel students={filtered} />
                  </section>
                </div>
              </div>
            );
          }
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="loadingRow"><td colSpan={7}>Loading...</td></tr>
          ) : students.length === 0 ? (
            <tr className="emptyRow"><td colSpan={7}>No students found.</td></tr>
          ) : (
            students.map(s => (
              <tr key={s.student_id} className="dataRow">
                <td>{s.nickname}</td>
                <td>{s.age ?? "-"}</td>
                <td>{s.total_xp}</td>
                <td>{s.completed_lessons}</td>
                <td>{s.accuracy_avg ? s.accuracy_avg + "%" : "-"}</td>
                <td>{s.last_active ? new Date(s.last_active).toLocaleDateString() : "-"}</td>
                <td>
                  <button
                    onClick={() => handleRemove(s.student_id)}
                    disabled={removing === s.student_id}
                    className={styles.removeBtn}
                  >
                    {removing === s.student_id ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
            <button type="submit" className={styles.addBtn} disabled={loading}>Add</button>
            {status && (
              <span className={styles.statusMsg + " " + (status === "Student added!" ? styles.statusSuccess : styles.statusError)}>{status}</span>
            )}
          </form>
          <input
            type="text"
            placeholder="Search by nickname"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <StudentList students={filtered} loading={loading} removing={removing} handleRemove={handleRemove} />
        </section>
        {/* Additional panels (AssignmentsPanel, MissionUnlockPanel, etc.) can be added here as needed */}
        {/* For now, only the main student list and analytics are rendered to ensure the file compiles and runs */}
        <section className={styles.analyticsPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Student Progress Analytics</h2>
            <ExportProgressCSV />
          </div>
          <StudentProgressAnalyticsPanel students={filtered} />
        </section>
      </div>
    </div>
  );

