
import React, { useState, useMemo } from "react";
import { Users, BarChart3, Settings, Volume2, MapPin, TreePine, Sparkles, Bell, BookOpen, Activity, Target, Save, GraduationCap, Star, TrendingUp, UserPlus } from "lucide-react";
import styles from "./TherapistPortalPage.module.css";
import { PatientHeader } from "@/components/PatientHeader";
import { PhoneticAnalysis } from "@/components/PhoneticAnalysis";
import TherapistCalibrationSection from "@/components/TherapistCalibrationSection";
import AccuracyTrendChart from "@/components/AccuracyTrendChart";
import LessonCompletionChart from "@/components/LessonCompletionChart";
import PhonemeHeatmap from "@/components/PhonemeHeatmap";
import MiniGameConfigPanel from "@/components/MiniGameConfigPanel";
import { useSTDashboard } from "@/hooks/useSTDashboard";
import {
	getAuraJourneyUnlocked,
	getAuraStoryUnlocked,
	getMissionUnlockChimeEnabled,
	getModulationSession,
	getVoiceCloneWord,
	setAuraJourneyUnlocked,
	setAuraStoryUnlocked,
	setMissionUnlockChimeEnabled,
	setModulationSession,
	setVoiceCloneWord,
} from "@/lib/therapistMissionConfig";

const WORD_OPTIONS = ["媽媽", "波波", "爸爸", "花花", "書包", "香港"];
const SESSION_OPTIONS = [
	{ id: "session-1", label: "調制訓練 Session 1（基礎）" },
	{ id: "session-2", label: "調制訓練 Session 2（進階）" },
	{ id: "session-3", label: "調制訓練 Session 3（挑戰）" },
];
const SCHOOL_OPTIONS = ["樂言小學", "維港小學", "海怡學校", "天朗特殊學校"];

const ACCENT_BLUE = "#2563eb";
const ACCENT_GREEN = "#10b981";
const ACCENT_AMBER = "#f59e0b";

const formatLastActive = (value: string | null) => {
	if (!value) {
		return "暫無紀錄";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "暫無紀錄";
	}

	return new Intl.DateTimeFormat("zh-HK", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const accuracyColor = (pct: number) => {
	if (pct >= 80) return ACCENT_GREEN;
	if (pct >= 60) return ACCENT_AMBER;
	return "#ef4444";
};

function AccuracyBar({ pct }: { pct: number }) {
	const color = accuracyColor(pct);
	return (
		<span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
			<span className={styles.progressBarOuter}>
				<span className={styles.progressBarInner} style={{ width: `${pct}%`, background: color }} />
			</span>
			<span className={styles.progressLabel} style={{ color }}>{pct}%</span>
		</span>
	);
}

function StudentAvatar({ name }: { name: string }) {
	const initial = (name || "?").charAt(0);
	return <span className={styles.studentAvatar}>{initial}</span>;
}

export default function TherapistPortalPage() {
	const { students, loading: studentsLoading, createStudent } = useSTDashboard();
	const [selectedSchool, setSelectedSchool] = useState(SCHOOL_OPTIONS[0]);
	const [selectedStudentId, setSelectedStudentId] = useState("");
	const [voiceWord, setVoiceWordState] = useState(getVoiceCloneWord());
	const [sessionId, setSessionIdState] = useState(getModulationSession());
	const [storyUnlocked, setStoryUnlockedState] = useState(getAuraStoryUnlocked());
	const [journeyUnlocked, setJourneyUnlockedState] = useState(getAuraJourneyUnlocked());
	const [unlockChimeEnabled, setUnlockChimeEnabled] = useState(getMissionUnlockChimeEnabled());
	const [status, setStatus] = useState("");

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [createLoading, setCreateLoading] = useState(false);
	const [createError, setCreateError] = useState("");
	const [createSuccess, setCreateSuccess] = useState("");
	const [form, setForm] = useState({
		email: "",
		password: "",
		first_name: "",
		last_name: "",
		username: "",
		date_of_birth: "",
		nickname: "",
		age: "",
		gender: "",
	});

	const handleCreateStudent = async () => {
		if (!form.email || !form.password || !form.username) {
			setCreateError("必須填寫電郵、密碼及用戶名稱");
			return;
		}
		setCreateLoading(true);
		setCreateError("");
		setCreateSuccess("");

		const { error, data } = await createStudent({
			email: form.email,
			password: form.password,
			first_name: form.first_name || undefined,
			last_name: form.last_name || undefined,
			username: form.username,
			date_of_birth: form.date_of_birth || undefined,
			nickname: form.nickname || undefined,
			age: form.age ? parseInt(form.age, 10) : undefined,
			gender: form.gender || undefined,
		});

		setCreateLoading(false);
		if (error) {
			setCreateError(error.message);
		} else {
			setCreateSuccess(`已建立學生帳號：${data?.username || form.username}`);
			setForm({ email: "", password: "", first_name: "", last_name: "", username: "", date_of_birth: "", nickname: "", age: "", gender: "" });
			setShowCreateForm(false);
		}
	};

	const displayStudents = useMemo(() => {
		if (!studentsLoading && students.length === 0) {
			return [
				{ student_id: "demo-001", nickname: "陳小明", age: 8, total_xp: 1250, completed_lessons: 18, accuracy_avg: 72, last_active: new Date(Date.now() - 86400000).toISOString() },
				{ student_id: "demo-002", nickname: "李芷晴", age: 7, total_xp: 980, completed_lessons: 14, accuracy_avg: 58, last_active: new Date(Date.now() - 172800000).toISOString() },
			];
		}
		return students;
	}, [students, studentsLoading]);

	const selectedStudent = displayStudents.find((student) => student.student_id === selectedStudentId) ?? displayStudents[0] ?? null;
	const totalStudents = displayStudents.length;
	const averageAccuracy = totalStudents > 0
		? Math.round(displayStudents.reduce((sum, student) => sum + student.accuracy_avg, 0) / totalStudents)
		: 0;
	const totalCompletedLessons = displayStudents.reduce((sum, student) => sum + student.completed_lessons, 0);
	const topStudent = displayStudents.reduce((best, current) => {
		if (!best) {
			return current;
		}
		return current.accuracy_avg > best.accuracy_avg ? current : best;
	}, null as (typeof displayStudents)[number] | null);

	const applySettings = () => {
		setVoiceCloneWord(voiceWord);
		setModulationSession(sessionId);
		setAuraStoryUnlocked(storyUnlocked);
		setAuraJourneyUnlocked(journeyUnlocked);
		setMissionUnlockChimeEnabled(unlockChimeEnabled);
		setStatus("已更新設定：學生端會即時顯示最新任務與訓練內容。");
	};

	return (
		<div className={styles.portalRoot}>
			<div className={styles.portalHeader}>
				<h1 className={styles.portalTitle}>
					<GraduationCap size={28} color={ACCENT_BLUE} />
					治療師控制台
				</h1>
				<p className={styles.portalSubtitle}>
					檢視學校學生概況、學習表現與數據分析；設定聲線複製字詞、開放調制訓練 Session，以及解鎖森林任務（Aura Story / Aura Journey）。
				</p>
			</div>

			{/* ─── 1) School Selection ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<MapPin size={18} color={ACCENT_BLUE} />
						已選學校
					</h2>
					<span className={styles.panelBadge}>{selectedSchool}</span>
				</div>
				<p className={styles.portalDesc}>揀選你要跟進嘅學校：</p>
				<div className={styles.selectGroup}>
					<select
						className={styles.addInput}
						value={selectedSchool}
						onChange={(event) => setSelectedSchool(event.target.value)}
					>
						{SCHOOL_OPTIONS.map((school) => (
							<option key={school} value={school}>{school}</option>
						))}
					</select>
				</div>
			</section>

			{/* ─── 2) Student List ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<Users size={18} color={ACCENT_BLUE} />
						學生名單
					</h2>
					<span className={styles.panelBadge}>{totalStudents} 位</span>
				</div>
				{studentsLoading ? (
					<p className={styles.portalDesc}>載入學生資料中...</p>
				) : displayStudents.length === 0 ? (
					<p className={styles.portalDesc}>暫時未有學生資料。</p>
				) : (
					<>
						<p className={styles.portalDesc}>以下為所選學校之學生清單與學習概況。</p>
						<div className={styles.tableWrap}>
							<table className={styles.portalTable}>
								<thead>
									<tr>
										<th>學生</th>
										<th>年齡</th>
										<th>完成課堂</th>
										<th>平均準確率</th>
										<th>最後活動</th>
									</tr>
								</thead>
								<tbody>
									{displayStudents.map((student) => (
										<tr key={student.student_id} className={styles.dataRow}>
											<td>
												<div className={styles.studentNameCell}>
													<StudentAvatar name={student.nickname || student.student_id} />
													<div className={styles.studentInfo}>
														<span className={styles.studentName}>{student.nickname || student.student_id}</span>
														<span className={styles.studentId}>{student.student_id}</span>
													</div>
												</div>
											</td>
											<td>{student.age ?? "--"}</td>
											<td>{student.completed_lessons}</td>
											<td><AccuracyBar pct={student.accuracy_avg} /></td>
											<td>{formatLastActive(student.last_active)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className={styles.checkRow} style={{ marginTop: 16 }}>
							<Star size={16} color={ACCENT_AMBER} />
							<span className={styles.checkLabel}>重點跟進學生：</span>
							<select
								className={styles.addInput}
								style={{ width: 200 }}
								value={selectedStudent?.student_id ?? ""}
								onChange={(event) => setSelectedStudentId(event.target.value)}
							>
								{displayStudents.map((student) => (
									<option key={student.student_id} value={student.student_id}>
										{student.nickname || student.student_id}
									</option>
								))}
							</select>
						</div>
					</>
				)}

				<div style={{ marginTop: 16 }}>
					<button
						className={styles.addBtn}
						onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(""); setCreateSuccess(""); }}
						type="button"
					>
						<UserPlus size={16} />
						{showCreateForm ? "隱藏建立學生" : "建立新學生帳號"}
					</button>
				</div>

				{showCreateForm && (
					<div style={{ marginTop: 16, padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
						<p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>新學生資料</p>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="電郵 *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="密碼 *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="用戶名稱 *" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="暱稱" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="名字" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="姓氏" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="出生日期" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
							<input className={styles.addInput} style={{ width: "100%" }} placeholder="年齡" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
							<select className={styles.addInput} style={{ width: "100%" }} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
								<option value="">性別</option>
								<option value="M">男</option>
								<option value="F">女</option>
								<option value="other">其他</option>
							</select>
						</div>
						{createError && <p className={styles.statusError} style={{ marginTop: 12 }}>{createError}</p>}
						{createSuccess && <div className={styles.statusSuccess} style={{ marginTop: 12 }}><Sparkles size={16} />{createSuccess}</div>}
						<button className={styles.addBtn} style={{ marginTop: 12 }} onClick={handleCreateStudent} disabled={createLoading} type="button">
							{createLoading ? "建立中..." : "確認建立"}
						</button>
					</div>
				)}
			</section>

			{/* ─── Patient Header (when student selected) ─── */}
			{selectedStudent && (
				<PatientHeader
					patientName={selectedStudent.nickname || selectedStudent.student_id}
					chineseName={selectedStudent.nickname || selectedStudent.student_id}
					age={selectedStudent.age ?? 0}
					gender="M"
					caseNumber={selectedStudent.student_id.slice(0, 8)}
					school={selectedSchool}
					mainLanguage="廣東話"
					secondaryLanguage="英語"
					therapist="治療師"
				/>
			)}

			{/* ─── 3) Performance Summary ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<Activity size={18} color={ACCENT_BLUE} />
						學生表現
					</h2>
				</div>
				<div className={styles.statsRow}>
					<div className={styles.statCard}>
						<p className={styles.statLabel}>
							<Users size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
							學生總數
						</p>
						<p className={styles.statValue}>{totalStudents}</p>
						<p className={styles.statSubtext}>所選學校</p>
					</div>
					<div className={styles.statCard}>
						<p className={styles.statLabel}>
							<Target size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
							整體平均準確率
						</p>
						<p className={`${styles.statValue} ${styles.statValueAccent}`}>{averageAccuracy}%</p>
						<p className={styles.statSubtext}>全校綜合</p>
					</div>
					<div className={styles.statCard}>
						<p className={styles.statLabel}>
							<BookOpen size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
							總完成課堂
						</p>
						<p className={styles.statValue}>{totalCompletedLessons}</p>
						<p className={styles.statSubtext}>累積堂數</p>
					</div>
					<div className={styles.statCard}>
						<p className={styles.statLabel}>
							<TrendingUp size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
							最高表現學生
						</p>
						<p className={styles.statValue}>{topStudent ? (topStudent.nickname || topStudent.student_id) : "--"}</p>
						<p className={styles.statSubtext}>準確率 {topStudent ? `${topStudent.accuracy_avg}%` : ""}</p>
					</div>
				</div>
				{selectedStudent ? (
					<div className={styles.metricCard} style={{ marginTop: 8 }}>
						<p className={styles.metricLabel} style={{ textTransform: "none" }}>
							目前跟進：{selectedStudent.nickname || selectedStudent.student_id}
						</p>
						<p className={styles.metricValue} style={{ fontSize: 20, color: ACCENT_BLUE }}>
							{selectedStudent.accuracy_avg}% 準確率 · {selectedStudent.completed_lessons} 課完成
						</p>
					</div>
				) : (
					<p className={styles.portalDesc}>請先新增學生，先可以檢視個別表現。</p>
				)}
			</section>

			{/* ─── 4) Analytics ─── */}
			<div className={styles.analyticsPanel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<BarChart3 size={18} color={ACCENT_BLUE} />
						學習分析
					</h2>
				</div>
				<ul className={styles.analyticsList}>
					<li><MapPin size={14} color={ACCENT_AMBER} />所選學校：{selectedSchool}</li>
					<li><Users size={14} color={ACCENT_BLUE} />本校活躍學生：{totalStudents} 位</li>
					<li><BookOpen size={14} color={ACCENT_GREEN} />課堂參與總量：{totalCompletedLessons} 堂</li>
					<li><Target size={14} color={ACCENT_GREEN} />校本整體準確率：{averageAccuracy}%</li>
					<li className={styles.analyticsWarning}>
						<Sparkles size={14} />建議：優先跟進準確率低於 70% 學生，安排額外口肌與語音訓練。
					</li>
				</ul>
			</div>

			{/* ─── Charts Section (only when student selected) ─── */}
			{selectedStudent && (
				<section className={styles.chartPanel}>
					<div className={styles.panelHeader}>
						<h2 className={styles.panelTitle}>
							<BarChart3 size={18} color={ACCENT_BLUE} />
							{selectedStudent.nickname || selectedStudent.student_id} 分析圖表
						</h2>
					</div>
					<div className={styles.chartGrid}>
						<div className={styles.chartCard}>
							<p className={styles.chartCardTitle}>準確率趨勢（30日）</p>
							<AccuracyTrendChart studentId={selectedStudent.student_id} />
						</div>
						<div className={styles.chartCard}>
							<p className={styles.chartCardTitle}>課堂完成量（按週）</p>
							<LessonCompletionChart studentId={selectedStudent.student_id} />
						</div>
					</div>
					<div className={styles.chartCard} style={{ marginTop: 16 }}>
						<p className={styles.chartCardTitle}>語音分類表現</p>
						<PhonemeHeatmap studentId={selectedStudent.student_id} />
					</div>
				</section>
			)}

			{/* ─── Mini-Game Config ─── */}
			{selectedStudent && (
				<MiniGameConfigPanel
					studentId={selectedStudent.student_id}
					studentName={selectedStudent.nickname || selectedStudent.student_id}
				/>
			)}

			{/* ─── Phonetic Analysis ─── */}
			<div className={styles.sectionMargin}>
				<PhoneticAnalysis />
			</div>

			{/* ─── Calibration Section ─── */}
			<div className={styles.sectionMargin}>
				<TherapistCalibrationSection />
			</div>

			{/* ─── 5) Voice Clone Word ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<Volume2 size={18} color={ACCENT_BLUE} />
						聲線複製字詞設定
					</h2>
				</div>
				<p className={styles.portalDesc}>選擇學生做 Voice Clone 時用邊個字詞。</p>
				<div className={styles.selectGroup}>
					<select
						className={styles.addInput}
						value={voiceWord}
						onChange={(event) => setVoiceWordState(event.target.value)}
					>
						{WORD_OPTIONS.map((word) => (
							<option key={word} value={word}>{word}</option>
						))}
					</select>
				</div>
			</section>

			{/* ─── 6) Modulation Session ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<Settings size={18} color={ACCENT_BLUE} />
						開放調制 Session
					</h2>
				</div>
				<p className={styles.portalDesc}>選擇學生地圖放大後可以進入邊個 modulation session。</p>
				<div className={styles.selectGroup}>
					<select
						className={styles.addInput}
						value={sessionId}
						onChange={(event) => setSessionIdState(event.target.value)}
					>
						{SESSION_OPTIONS.map((session) => (
							<option key={session.id} value={session.id}>{session.label}</option>
						))}
					</select>
				</div>
			</section>

			{/* ─── 7) Forest Unlock ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<TreePine size={18} color={ACCENT_BLUE} />
						森林任務解鎖
					</h2>
				</div>
				<label className={styles.checkRow}>
					<input
						type="checkbox"
						checked={storyUnlocked}
						onChange={(event) => setStoryUnlockedState(event.target.checked)}
					/>
					<span className={styles.checkLabel}>Aura Story（森林故事任務）</span>
				</label>
				<label className={styles.checkRow}>
					<input
						type="checkbox"
						checked={journeyUnlocked}
						onChange={(event) => setJourneyUnlockedState(event.target.checked)}
					/>
					<span className={styles.checkLabel}>Aura Journey（森林旅程任務）</span>
				</label>
			</section>

			{/* ─── 8) Chime Setting ─── */}
			<section className={styles.panel}>
				<div className={styles.panelHeader}>
					<h2 className={styles.panelTitle}>
						<Bell size={18} color={ACCENT_BLUE} />
						解鎖音效設定
					</h2>
				</div>
				<label className={styles.checkRow}>
					<input
						type="checkbox"
						checked={unlockChimeEnabled}
						onChange={(event) => setUnlockChimeEnabled(event.target.checked)}
					/>
					<span className={styles.checkLabel}>任務首次解鎖時播放「叮」提示音</span>
				</label>
			</section>

			{/* ─── Save ─── */}
			<button className={styles.addBtn} onClick={applySettings} type="button">
				<Save size={16} />
				儲存並同步到學生端
			</button>
			{status ? <p className={styles.statusSuccess}><Sparkles size={16} />{status}</p> : null}
		</div>
	);
}
