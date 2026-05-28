import * as React from "react"
import { DATA } from "./schoolsData"

export default function App() {
    // 1. Điểm hiện tại (Toán, Văn, Anh)
    const [scores, setScores] = React.useState({ t: "", v: "", a: "" })
    
    // NEW: Điểm quá khứ (Cho phép mỗi học sinh tự nhập điểm riêng của mình)
    const [pastTotals, setPastTotals] = React.useState({ ks: "16.5", gk: "19.0", hk: "21.5" })
    
    const [search, setSearch] = React.useState("")
    const [active, setActive] = React.useState(null)

    // Tính tổng điểm hiện tại dựa trên ô nhập
    const total =
        (Number(scores.t) || 0) +
        (Number(scores.v) || 0) +
        (Number(scores.a) || 0)

    const filtered = DATA.filter((s) =>
        s.n.toLowerCase().includes(search.toLowerCase())
    )

    const getAvg = (arr) =>
        (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)

    // THUẬT TOÁN PHÂN TÍCH RỦI RO (PHƯƠNG ÁN 4)
    const calculateRiskAnalysis = (school, studentScore) => {
        const scoresH = school.v1
        const avgH = scoresH.reduce((a, b) => a + b, 0) / scoresH.length
        const maxH = Math.max(...scoresH)
        const minH = Math.min(...scoresH)
        const delta = maxH - minH || 0.5 

        let percentage = 0
        let statusText = ""
        let statusColor = ""

        if (studentScore === 0) {
            return { percentage: 0, text: "Chờ nhập điểm", color: "#64748b", delta }
        }

        if (studentScore >= maxH + 1) {
            percentage = Math.min(99, 90 + (studentScore - maxH) * 10)
            statusText = `An Tâm Tuyệt Đối (${percentage.toFixed(0)}%)`
            statusColor = "#059669"
        } else if (studentScore >= avgH) {
            percentage = 70 + ((studentScore - avgH) / (maxH + 1 - avgH)) * 20
            statusText = `Cơ Hội Cao (${percentage.toFixed(0)}%)`
            statusColor = "#10b981"
        } else if (studentScore >= minH) {
            percentage = 45 + ((studentScore - minH) / (avgH - minH)) * 25
            statusText = `Vùng Ranh Giới (${percentage.toFixed(0)}%)`
            statusColor = "#d97706"
        } else if (studentScore >= minH - 1) {
            percentage = 15 + ((studentScore - (minH - 1)) / 1) * 30
            statusText = `Nguy Cơ Cao (${percentage.toFixed(0)}%)`
            statusColor = "#dc2626"
        } else {
            percentage = Math.max(1, 15 - ((minH - 1) - studentScore) * 10)
            statusText = `Rủi Ro Lớn (${percentage.toFixed(0)}%)`
            statusColor = "#7f1d1d"
        }

        return { percentage, text: statusText, color: statusColor, delta }
    }

    // DỮ LIỆU ĐỒ THỊ TIẾN ĐỘ ĐÃ ĐƯỢC DÂN CHỦ HÓA (ĐỌC TỪ STATE)
    const progressData = [
        { label: "Khảo sát", score: Number(pastTotals.ks) || 0 },
        { label: "Giữa Kỳ I", score: Number(pastTotals.gk) || 0 },
        { label: "Học Kỳ I", score: Number(pastTotals.hk) || 0 },
        { label: "Hiện Tại", score: total > 0 ? total : (Number(pastTotals.hk) || 16.5) }
    ]

    // Hàm toán học chuyển đổi Điểm số thành Tọa độ Y trên sơ đồ SVG
    const getSvgX = (index) => 55 + index * 95
    const getSvgY = (score) => {
        const chartMinScore = 10
        const chartMaxScore = 30
        const chartHeight = 110
        const safeScore = Math.max(chartMinScore, Math.min(chartMaxScore, score))
        return 130 - ((safeScore - chartMinScore) / (chartMaxScore - chartMinScore)) * chartHeight
    }

    const activeSchool = active !== null ? filtered[active] : null
    const targetScore = activeSchool ? Number(getAvg(activeSchool.v1)) : null

    const linePathD = progressData.map((d, i) => `${i === 0 ? "M" : "L"} ${getSvgX(i)} ${getSvgY(d.score)}`).join(" ")

    return (
        <div style={styles.container}>
            <div style={styles.appCard}>
                <div style={styles.headerArea}>
                    <h2 style={styles.headerTitle}>AI Tư Vấn Tuyển Sinh Động</h2>
                    <p style={styles.headerSubtitle}>
                        Hệ thống cá nhân hóa lộ trình và phân tích rủi ro biến động
                    </p>
                </div>

                {/* VÙNG NHẬP ĐIỂM HIỆN TẠI */}
                <div style={styles.scoreSection}>
                    <div style={styles.sectionTitle}>🎯 Nhập điểm thi thử hiện tại:</div>
                    <div style={styles.inputGroup}>
                        {["t", "v", "a"].map((subject, idx) => (
                            <div key={subject} style={styles.inputWrapper}>
                                <span style={styles.inputLabel}>
                                    {["Toán", "Văn", "Anh"][idx]}
                                </span>
                                <input
                                    style={styles.input}
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.25"
                                    placeholder="0"
                                    value={scores[subject]}
                                    onChange={(e) => {
                                        let val = e.target.value
                                        if (val === "") {
                                            setScores({ ...scores, [subject]: "" })
                                            return
                                        }
                                        let num = parseFloat(val)
                                        if (num > 10) val = "10"
                                        if (num < 0) val = "0"
                                        setScores({ ...scores, [subject]: val })
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={styles.totalDisplay}>
                        <span style={styles.totalLabel}>TỔNG ĐIỂM LỚP 10 DỰ KIẾN</span>
                        <div style={styles.totalValue}>{total.toFixed(2)}</div>
                    </div>
                </div>

                {/* NEW SECTION: VÙNG NHẬP ĐIỂM QUÁ KHỨ (GIÚP TẤT CẢ HỌC SINH ĐỀU DÙNG ĐƯỢC) */}
                <div style={styles.pastScoreSection}>
                    <div style={styles.sectionTitle}>🕒 Điều chỉnh tổng điểm các kỳ trước:</div>
                    <div style={styles.inputGroup}>
                        {[
                            { key: "ks", label: "Khảo sát" },
                            { key: "gk", label: "Giữa Kỳ 1" },
                            { key: "hk", label: "Học Kỳ 1" }
                        ].map((item) => (
                            <div key={item.key} style={styles.inputWrapper}>
                                <span style={styles.pastInputLabel}>{item.label}</span>
                                <input
                                    style={styles.pastInput}
                                    type="number"
                                    min="10"
                                    max="30"
                                    step="0.5"
                                    value={pastTotals[item.key]}
                                    onChange={(e) => setPastTotals({ ...pastTotals, [item.key]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* PHƯƠNG ÁN 2: ĐỒ THỊ TIẾN ĐỘ ĐĂNG LỰC ĐỘNG (BÂY GIỜ ĐÃ ĐỘNG 100%) */}
                <div style={styles.chartCard}>
                    <div style={styles.chartTitleArea}>
                        <span style={styles.chartTitle}>📈 Biểu Đồ Xu Hướng Năng Lực</span>
                        {targetScore && (
                            <span style={styles.targetLabelIndicator}>
                                Mục tiêu: {targetScore.toFixed(2)}
                            </span>
                        )}
                    </div>
                    
                    <svg style={styles.svgContainer} width="100%" height="160">
                        {[10, 15, 20, 25, 30].map((gridScore) => (
                            <g key={gridScore}>
                                <line x1="45" y1={getSvgY(gridScore)} x2="350" y2={getSvgY(gridScore)} stroke="#f1f5f9" strokeWidth="1" />
                                <text x="12" y={getSvgY(gridScore) + 4} fill="#94a3b8" fontSize="10" fontWeight="600">{gridScore}đ</text>
                            </g>
                        ))}

                        {targetScore && (
                            <g>
                                <line x1="45" y1={getSvgY(targetScore)} x2="350" y2={getSvgY(targetScore)} stroke="#ef4444" strokeDasharray="4 4" strokeWidth="2" />
                                <circle cx="350" cy={getSvgY(targetScore)} r="3" fill="#ef4444" />
                            </g>
                        )}

                        <path d={linePathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {progressData.map((d, i) => (
                            <g key={i}>
                                <circle cx={getSvgX(i)} cy={getSvgY(d.score)} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
                                <text x={getSvgX(i)} y={getSvgY(d.score) - 10} fill="#1e3a8a" fontSize="10" fontWeight="700" textAnchor="middle">
                                    {d.score.toFixed(1)}
                                </text>
                                <text x={getSvgX(i)} y="150" fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle">
                                    {d.label}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* THANH TÌM KIẾM CÁC TRƯỜNG */}
                <div style={styles.searchContainer}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                        style={styles.searchBar}
                        placeholder="Tìm kiếm trường cấp 3 để so mục tiêu..."
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* DANH SÁCH CÁC TRƯỜNG THPT */}
                <div style={styles.listContainer}>
                    <div style={styles.scrollArea}>
                        {filtered.map((school, index) => {
                            const avg1 = Number(getAvg(school.v1))
                            const analysis = calculateRiskAnalysis(school, total)

                            return (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.schoolItem,
                                        borderLeft: `5px solid ${analysis.color}`,
                                        backgroundColor: active === index ? "#f8fafc" : "#fff",
                                    }}
                                    onClick={() => setActive(active === index ? null : index)}
                                >
                                    <div style={styles.itemMain}>
                                        <div>
                                            <div style={styles.schoolName}>{school.n}</div>
                                            <div style={styles.schoolMeta}>
                                                Điểm chuẩn: {Math.min(...school.v1)} → Cao nhất: {Math.max(...school.v1)}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                ...styles.badge,
                                                backgroundColor: analysis.color + "15",
                                                color: analysis.color,
                                                border: `1px solid ${analysis.color}40`
                                            }}
                                        >
                                            {analysis.text}
                                        </div>
                                    </div>

                                    {active === index && (
                                        <div style={styles.detailsPane}>
                                            <div style={{ marginBottom: "12px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                                                    <span>Xác suất trúng tuyển dự tính:</span>
                                                    <strong>{analysis.percentage.toFixed(0)}%</strong>
                                                </div>
                                                <div style={{ width: "100%", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ width: `${analysis.percentage}%`, height: "100%", backgroundColor: analysis.color, transition: "width 0.5s ease" }}></div>
                                                </div>
                                            </div>

                                            <div style={styles.detailsGrid}>
                                                <div style={styles.gridBox}>
                                                    <span>Điểm Chuẩn TB</span>
                                                    <strong>{avg1}đ</strong>
                                                </div>
                                                <div style={styles.gridBox}>
                                                    <span>Độ Dao Động (Delta)</span>
                                                    <strong style={{ color: analysis.delta > 1.5 ? "#ef4444" : "#10b981" }}>
                                                        ±{analysis.delta.toFixed(2)}
                                                    </strong>
                                                </div>
                                            </div>
                                            <div style={styles.historyText}>
                                                Điểm chuẩn gốc: 2023 ({school.v1[0]}) | 2024 ({school.v1[1]}) | 2025 ({school.v1[2]})
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: { width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", backgroundColor: "#f1f5f9", padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" },
    appCard: { width: "100%", maxWidth: "450px", backgroundColor: "#ffffff", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", overflow: "hidden", display: "flex", flexDirection: "column" },
    headerArea: { padding: "32px 24px 20px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", color: "#ffffff", textAlign: "center" },
    headerTitle: { margin: 0, fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" },
    headerSubtitle: { margin: "8px 0 0", fontSize: "13px", opacity: 0.8 },
    sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "10px" },
    scoreSection: { padding: "20px 24px 10px", backgroundColor: "#ffffff" },
    
    // STYLE CHO VÙNG ĐIỂM QUÁ KHỨ MỚI
    pastScoreSection: { padding: "0px 24px 15px", backgroundColor: "#ffffff" },
    pastInputLabel: { fontSize: "11px", fontWeight: "600", color: "#64748b", textAlign: "center" },
    pastInput: { width: "100%", padding: "8px", borderRadius: "10px", border: "2px solid #f1f5f9", textAlign: "center", fontSize: "14px", fontWeight: "700", color: "#475569", outline: "none" },

    inputGroup: { display: "flex", gap: "12px" },
    inputWrapper: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
    inputLabel: { fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "center" },
    input: { width: "100%", padding: "12px", borderRadius: "12px", border: "2px solid #f1f5f9", textAlign: "center", fontSize: "16px", fontWeight: "700", color: "#1e293b", outline: "none" },
    totalDisplay: { padding: "12px", marginTop: "12px", borderRadius: "16px", background: "#f8fafc", border: "1px dashed #e2e8f0", textAlign: "center" },
    totalLabel: { fontSize: "10px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px" },
    totalValue: { fontSize: "32px", fontWeight: "900", color: "#1e3a8a" },
    
    chartCard: { padding: "16px", margin: "0 24px 20px", backgroundColor: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
    chartTitleArea: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
    chartTitle: { fontSize: "12px", fontWeight: "800", color: "#334155" },
    targetLabelIndicator: { fontSize: "11px", fontWeight: "700", color: "#ef4444", backgroundColor: "#fee2e2", padding: "2px 8px", borderRadius: "6px" },
    svgContainer: { display: "block", marginTop: "5px" },

    searchContainer: { padding: "0 24px", position: "relative" },
    searchIcon: { position: "absolute", left: "36px", top: "12px", opacity: 0.4 },
    searchBar: { width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", fontSize: "14px" },
    listContainer: { padding: "16px 24px 24px", flex: 1 },
    scrollArea: { maxHeight: "260px", overflowY: "auto", paddingRight: "4px" },
    schoolItem: { padding: "16px", borderRadius: "16px", marginBottom: "12px", cursor: "pointer", border: "1px solid #f1f5f9", transition: "all 0.2s" },
    itemMain: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    schoolName: { fontSize: "14px", fontWeight: "700", color: "#1e293b" },
    schoolMeta: { fontSize: "12px", color: "#64748b", marginTop: "2px" },
    badge: { padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" },
    detailsPane: { marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" },
    detailsGrid: { display: "flex", gap: "8px", marginBottom: "12px" },
    gridBox: { flex: 1, padding: "8px", borderRadius: "8px", backgroundColor: "#ffffff", border: "1px solid #f1f5f9", textAlign: "center", display: "flex", flexDirection: "column", gap: "2px", fontSize: "12px" },
    historyText: { fontSize: "10px", color: "#94a3b8", textAlign: "center" },
}