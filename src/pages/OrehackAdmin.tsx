import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Award,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Lock,
  LogOut,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  Cpu,
  RotateCcw,
  Shuffle,
  UserX,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllTeams,
  addOrUpdateTeam,
  deleteTeam,
  deleteAllTeams,
  getAllJury,
  addOrUpdateJury,
  deleteJury,
  getAllEvaluations,
  getEventSettings,
  updateEventSettings,
  parseTeamsCSV,
  bulkImportTeams,
  parseToolScoresCSV,
  bulkApplyToolScores,
  validateToolScoreMatch,
  ParsedToolScore,
  calculateCombinedScores,
  autoAssignTeamsToJury,
  revokeAllJuryAssignments,
  reassignTeamJury,
  clearTeamEvaluationStatus,
  DEFAULT_COMMON_PROBLEM_STATEMENT,
  DEFAULT_COMMON_PROBLEM_DESCRIPTION,
  OrehackTeam,
  OrehackJury,
  OrehackEvaluation,
  OrehackEventSettings,
} from "@/lib/orehack-db";

export default function OrehackAdmin() {
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Data states
  const [settings, setSettings] = useState<OrehackEventSettings>({
    submissions_open: true,
    jury_evaluation_open: true,
    active_round: "Round 1",
    leaderboard_published: true,
    common_problem_statement: DEFAULT_COMMON_PROBLEM_STATEMENT,
    common_problem_description: DEFAULT_COMMON_PROBLEM_DESCRIPTION,
  });
  const [teams, setTeams] = useState<OrehackTeam[]>([]);
  const [juryList, setJuryList] = useState<OrehackJury[]>([]);
  const [evaluations, setEvaluations] = useState<OrehackEvaluation[]>([]);
  const [activeTab, setActiveTab] = useState<"teams" | "jury" | "evaluations" | "settings">("teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [repoFilter, setRepoFilter] = useState<"all" | "submitted" | "pending">("all");

  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isJuryModalOpen, setIsJuryModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isCriteriaScoreModalOpen, setIsCriteriaScoreModalOpen] = useState(false);
  const [isPSModalOpen, setIsPSModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deleteAllPasskey, setDeleteAllPasskey] = useState("");
  const [deleteAllError, setDeleteAllError] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Auto Assign Modal & Round-wise states
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [autoAssignRound, setAutoAssignRound] = useState<"Round 1" | "Round 2" | "Side Quest" | "all">("Round 1");
  const [autoAssignSelectedJuryIds, setAutoAssignSelectedJuryIds] = useState<string[]>([]);
  const [autoAssignTeamsPerJury, setAutoAssignTeamsPerJury] = useState<number>(10);
  const [activeJuryRoundView, setActiveJuryRoundView] = useState<"Round 1" | "Round 2" | "Side Quest">("Round 1");

  // CSV Import State
  const [csvText, setCsvText] = useState("");
  const [csvPreviewCount, setCsvPreviewCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool Evaluation CSV Import & Audit States
  const [isToolScoreModalOpen, setIsToolScoreModalOpen] = useState(false);
  const [toolScoreCSVText, setToolScoreCSVText] = useState("");
  const [parsedToolScores, setParsedToolScores] = useState<ParsedToolScore[]>([]);
  const [selectedTeamForToolAudit, setSelectedTeamForToolAudit] = useState<OrehackTeam | null>(null);
  const [isToolAuditModalOpen, setIsToolAuditModalOpen] = useState(false);
  const toolScoreFileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [teamForm, setTeamForm] = useState<Partial<OrehackTeam>>({
    team_name: "",
    leader_name: "",
    phone: "",
    password: "",
    is_approved: true,
    assigned_jury_id: "",
    assigned_jury_r1_id: "",
    assigned_jury_r2_id: "",
    assigned_jury_sidequest_id: "",
  });

  const [juryForm, setJuryForm] = useState<Partial<OrehackJury>>({
    jury_id: "",
    name: "",
    phone: "",
    password: "",
    panel_name: "Panel A - Autonomous Systems",
  });

  // Criteria-Wise Score Editing State
  const [selectedTeamForScore, setSelectedTeamForScore] = useState<OrehackTeam | null>(null);
  const [activeScoreTab, setActiveScoreTab] = useState<"r1" | "r2" | "sidequest">("r1");

  // R1 Rubrics (/35)
  const [r1_understanding, setR1Understanding] = useState<number>(0);
  const [r1_functionality, setR1Functionality] = useState<number>(0);
  const [r1_uiux, setR1Uiux] = useState<number>(0);
  const [r1_innovation, setR1Innovation] = useState<number>(0);

  // R2 Rubrics (/50) + Tool (/30 -> 30% weight)
  const [r2_understanding, setR2Understanding] = useState<number>(0);
  const [r2_functionality, setR2Functionality] = useState<number>(0);
  const [r2_technical, setR2Technical] = useState<number>(0);
  const [r2_uiux, setR2Uiux] = useState<number>(0);
  const [r2_innovation, setR2Innovation] = useState<number>(0);
  const [r2_tool_score, setR2ToolScore] = useState<number>(0);

  // Side Quest Rubrics (/25)
  const [sq_implementation, setSqImplementation] = useState<number>(0);
  const [sq_integration, setSqIntegration] = useState<number>(0);
  const [sq_technical_quality, setSqTechnicalQuality] = useState<number>(0);
  const [sq_uiux, setSqUiux] = useState<number>(0);
  const [sq_creativity, setSqCreativity] = useState<number>(0);

  // Common Problem Statement form state
  const [psTitle, setPsTitle] = useState("");
  const [psDescription, setPsDescription] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isAuthed =
      sessionStorage.getItem("orehack_admin_session") === "true" ||
      searchParams.get("key") === "cobotex2026";
    if (isAuthed) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("orehack_admin_session", "true");
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    const [fetchedSettings, fetchedTeams, fetchedJury, fetchedEvals] = await Promise.all([
      getEventSettings(),
      getAllTeams(),
      getAllJury(),
      getAllEvaluations(),
    ]);
    setSettings(fetchedSettings);
    setTeams(fetchedTeams);
    setJuryList(fetchedJury);
    setEvaluations(fetchedEvals);
    setPsTitle(fetchedSettings.common_problem_statement || DEFAULT_COMMON_PROBLEM_STATEMENT);
    setPsDescription(fetchedSettings.common_problem_description || DEFAULT_COMMON_PROBLEM_DESCRIPTION);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (adminUsername.trim() === "admin" || adminUsername.trim() === "orehack") &&
      adminPassword.trim() === "cobotex2026"
    ) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("orehack_admin_session", "true");
      toast.success("Admin access granted.");
      loadAllData();
    } else {
      setAuthError("Invalid Admin credentials. (Default: admin / cobotex2026)");
      toast.error("Invalid credentials.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("orehack_admin_session");
    setIsAdminAuthenticated(false);
    toast.info("Logged out of Admin Portal.");
  };

  const handleToggleSetting = async (key: keyof OrehackEventSettings) => {
    const updated = await updateEventSettings({ [key]: !settings[key] });
    setSettings(updated);
    toast.success(`Updated ${key.replace(/_/g, " ")}`);
  };

  const handleRoundChange = async (round: "Round 1" | "Round 2" | "Side Quest") => {
    const updated = await updateEventSettings({ active_round: round });
    setSettings(updated);
    toast.success(`Active round set to ${round}`);
  };

  const handleSaveCommonPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psTitle.trim()) {
      toast.error("Problem Statement title cannot be empty.");
      return;
    }
    const updated = await updateEventSettings({
      common_problem_statement: psTitle.trim(),
      common_problem_description: psDescription.trim(),
    });
    setSettings(updated);
    setIsPSModalOpen(false);
    toast.success("Common Problem Statement updated for all teams!");
  };

  // ── CSV PARSING & IMPORT ──
  const handleCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      const parsed = parseTeamsCSV(text, settings.common_problem_statement);
      setCsvPreviewCount(parsed.length);
    };
    reader.readAsText(file);
  };

  const handleExecuteCSVImport = async () => {
    if (!csvText.trim()) {
      toast.error("Please upload or paste CSV data.");
      return;
    }
    const parsed = parseTeamsCSV(csvText, settings.common_problem_statement);
    if (parsed.length === 0) {
      toast.error("No valid teams found in the CSV. Please check formatting.");
      return;
    }

    const res = await bulkImportTeams(parsed);
    setTeams(res.teams);
    setIsCSVModalOpen(false);
    setCsvText("");
    setCsvPreviewCount(null);
    toast.success(`Successfully registered ${res.count} teams via CSV!`);
  };

  const handleDownloadSampleCSV = () => {
    const sample = `Team Name,Leader Name,Phone Number\nAlpha Innovators,Aarav Patel,9876543210\nRoboCraft,Diya Sharma,9812345678\nRescueGrid,Rohan Gupta,9823456789\n`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "code_clash_teams_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample CSV template downloaded.");
  };

  // ── OREHACK TOOL EVALUATION CSV HANDLERS ──
  const handleToolScoreFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setToolScoreCSVText(text);
      const parsed = parseToolScoresCSV(text);
      setParsedToolScores(parsed);
    };
    reader.readAsText(file);
  };

  const handleToolScoreTextChange = (text: string) => {
    setToolScoreCSVText(text);
    const parsed = parseToolScoresCSV(text);
    setParsedToolScores(parsed);
  };

  const handleExecuteToolScoreImport = async () => {
    if (parsedToolScores.length === 0) {
      toast.error("No valid tool scores found. Please check CSV format.");
      return;
    }

    const res = await bulkApplyToolScores(parsedToolScores);
    setTeams(res.teams);
    setIsToolScoreModalOpen(false);
    setToolScoreCSVText("");
    setParsedToolScores([]);

    if (res.updatedCount > 0) {
      toast.success(
        `Applied tool scores to ${res.updatedCount} verified teams! (Both Team Name & Repo URL matched).`
      );
    } else {
      toast.warning("No teams updated. Both Team Name and registered Repo URL must match.");
    }
    if (res.mismatchedNames.length > 0) {
      toast.error(
        `${res.mismatchedNames.length} teams were rejected due to Repo URL mismatch or missing repo.`
      );
    }
    if (res.notFoundNames.length > 0) {
      toast.info(
        `${res.notFoundNames.length} teams in CSV were not found in tournament roster.`
      );
    }
    loadAllData();
  };

  const handleDownloadSampleToolCSV = () => {
    const sample = `Team_Name\tProblem_Statement\tRepo_URL\tProgress\tTotal_Scores\tTech_Scores\tInnov_Scores\tCompleteness_Scores\tReasoning\n` +
      `Alpha Innovators\tEmergency Response & Disaster Management Platform\thttps://github.com/alphainnovators/disaster-rescue\t100%\t26.5\t9.0\t8.5\t9.0\tRobust offline caching, real-time map clustering, and clean WebSocket coordination.\n` +
      `RoboCraft\tEmergency Response & Disaster Management Platform\thttps://github.com/robocraft/emergency-aid\t90%\t22.0\t7.5\t7.0\t7.5\tSolid mobile responsiveness and notification triage; missing edge case disaster failovers.\n`;
    const blob = new Blob([sample], { type: "text/tab-separated-values;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orehack_tool_evaluation_sample.tsv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample tool evaluation template downloaded.");
  };

  const handleOpenToolAuditModal = (team: OrehackTeam) => {
    setSelectedTeamForToolAudit(team);
    setIsToolAuditModalOpen(true);
  };

  // ── CSV EXPORT FOR REPOSITORIES (Team Name & Repo alone) ──
  const handleExportReposCSV = () => {
    const submittedTeams = teams.filter((t) => t.repo_link && t.repo_link.trim().length > 0);
    if (submittedTeams.length === 0) {
      toast.info("No teams have submitted GitHub repositories yet.");
      return;
    }

    let csv = "Team Name,GitHub Repository\n";
    submittedTeams.forEach((t) => {
      csv += `"${t.team_name}","${t.repo_link}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `code_clash_repositories_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${submittedTeams.length} submitted repositories!`);
  };

  // ── FULL TOURNAMENT SCORE REPORT CSV EXPORT ──
  const handleExportFullRosterCSV = () => {
    if (teams.length === 0) {
      toast.info("No teams registered yet.");
      return;
    }

    let csv = "Team ID,Team Name,Leader Name,Phone Number,GitHub Repo,R1 Score (/35),R2 Score (/50),R2 Tool Score (/30),Side Quest (/25),Total Score (/110)\n";
    teams.forEach((t) => {
      csv += `"${t.team_special_id}","${t.team_name}","${t.leader_name}","${t.phone || t.password || ""}","${t.repo_link || "Pending"}","${t.r1_score || 0}","${t.r2_score || 0}","${t.r2_tool_score || 0}","${t.sidequest_score || 0}","${t.total_score || 0}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `code_clash_full_evaluation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Full tournament score sheet exported!");
  };

  // ── SINGLE TEAM REGISTRATION ──
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.team_name || !teamForm.leader_name || !teamForm.phone) {
      toast.error("Please fill in Team Name, Leader Name, and 10-Digit Phone Number.");
      return;
    }

    const cleanPhone = (teamForm.phone || "").replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    const assignedJury = juryList.find((j) => j.jury_id === teamForm.assigned_jury_id);
    const assignedR1 = juryList.find((j) => j.jury_id === teamForm.assigned_jury_r1_id);
    const assignedR2 = juryList.find((j) => j.jury_id === teamForm.assigned_jury_r2_id);
    const assignedSQ = juryList.find((j) => j.jury_id === teamForm.assigned_jury_sidequest_id);

    await addOrUpdateTeam({
      team_special_id: teamForm.team_special_id || "",
      team_name: teamForm.team_name.trim(),
      leader_name: teamForm.leader_name.trim(),
      phone: cleanPhone,
      password: cleanPhone, // Complete 10 numbers
      is_approved: teamForm.is_approved ?? true,
      problem_statement: settings.common_problem_statement,
      repo_link: teamForm.repo_link?.trim() || "",
      assigned_jury_id: teamForm.assigned_jury_id || assignedR1?.jury_id || null,
      assigned_jury_name: assignedJury ? assignedJury.name : assignedR1 ? assignedR1.name : null,
      assigned_jury_r1_id: teamForm.assigned_jury_r1_id || null,
      assigned_jury_r1_name: assignedR1 ? assignedR1.name : null,
      assigned_jury_r2_id: teamForm.assigned_jury_r2_id || null,
      assigned_jury_r2_name: assignedR2 ? assignedR2.name : null,
      assigned_jury_sidequest_id: teamForm.assigned_jury_sidequest_id || null,
      assigned_jury_sidequest_name: assignedSQ ? assignedSQ.name : null,
      r1_score: teamForm.r1_score || 0,
      r2_jury_score: teamForm.r2_jury_score || 0,
      r2_tool_score: teamForm.r2_tool_score || 0,
      r2_score: teamForm.r2_score || 0,
      sidequest_score: teamForm.sidequest_score || 0,
    });

    setIsTeamModalOpen(false);
    toast.success("Team saved successfully.");
    loadAllData();
  };

  const handleDeleteTeam = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete Team "${name}"?`)) {
      await deleteTeam(id);
      toast.success(`Deleted Team "${name}".`);
      loadAllData();
    }
  };

  // ── DELETE ALL TEAMS (REQUIRES PASS: OREHACKOK) ──
  const handleOpenDeleteAllModal = () => {
    setDeleteAllPasskey("");
    setDeleteAllError("");
    setIsDeleteAllModalOpen(true);
  };

  const handleConfirmDeleteAllTeams = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (deleteAllPasskey.trim() !== "OREHACKOK") {
      setDeleteAllError("Incorrect passkey. Please enter OREHACKOK to confirm deletion.");
      toast.error("Incorrect deletion passkey.");
      return;
    }

    setIsDeletingAll(true);
    try {
      const res = await deleteAllTeams(deleteAllPasskey.trim());
      if (res.success) {
        setIsDeleteAllModalOpen(false);
        setDeleteAllPasskey("");
        setDeleteAllError("");
        setTeams([]);
        toast.success(res.message);
        loadAllData();
      } else {
        setDeleteAllError(res.message);
        toast.error(res.message);
      }
    } finally {
      setIsDeletingAll(false);
    }
  };

  // ── AUTO ASSIGN, REVOKE & REASSIGN JURY (ROUND-WISE & CAPACITY) ──
  const handleOpenAutoAssignModal = () => {
    if (juryList.length === 0) {
      toast.error("Please add at least one Jury member/panel before auto-assigning.");
      return;
    }
    if (teams.length === 0) {
      toast.error("No teams registered to assign.");
      return;
    }
    // Select all juries by default
    setAutoAssignSelectedJuryIds(juryList.map((j) => j.jury_id));
    // Calculate recommended capacity
    const defaultCapacity = Math.ceil(teams.length / (juryList.length || 1));
    setAutoAssignTeamsPerJury(defaultCapacity);
    setAutoAssignRound(
      settings.active_round === "Round 2"
        ? "Round 2"
        : settings.active_round === "Side Quest"
        ? "Side Quest"
        : "Round 1"
    );
    setIsAutoAssignModalOpen(true);
  };

  const handleExecuteAutoAssign = async () => {
    if (autoAssignSelectedJuryIds.length === 0) {
      toast.error("Please select at least one present jury member.");
      return;
    }
    if (autoAssignTeamsPerJury <= 0) {
      toast.error("Please enter a valid number of teams per jury.");
      return;
    }

    const res = await autoAssignTeamsToJury({
      round: autoAssignRound,
      selectedJuryIds: autoAssignSelectedJuryIds,
      teamsPerJury: Number(autoAssignTeamsPerJury),
    });

    setTeams(res.teams);
    setIsAutoAssignModalOpen(false);
    toast.success(
      `Auto-assigned ${res.assignedCount} teams across ${res.juryCount} judges for ${autoAssignRound} (Max ${autoAssignTeamsPerJury} teams each)!`
    );
    loadAllData();
  };

  const handleRevokeAssignments = async () => {
    const roundLabel = activeJuryRoundView;
    if (
      confirm(
        `Revoke jury assignments for ${roundLabel}? All teams assigned for this round will become unassigned.`
      )
    ) {
      const updated = await revokeAllJuryAssignments(roundLabel);
      setTeams(updated);
      toast.info(`Jury assignments for ${roundLabel} have been revoked.`);
      loadAllData();
    }
  };

  const handleRevokeAllRoundsAssignments = async () => {
    if (
      confirm(
        "Revoke jury assignments across ALL rounds (Round 1, Round 2, Side Quest)? All teams will become unassigned."
      )
    ) {
      const updated = await revokeAllJuryAssignments("all");
      setTeams(updated);
      toast.info("All jury assignments across all rounds have been revoked.");
      loadAllData();
    }
  };

  const handleInlineJuryChange = async (
    teamSpecialId: string,
    newJuryId: string,
    round: "Round 1" | "Round 2" | "Side Quest" = activeJuryRoundView
  ) => {
    const res = await reassignTeamJury(teamSpecialId, newJuryId || null, round);
    if (res) {
      if (!newJuryId) {
        toast.info(`Unassigned ${res.team_name} from ${round}.`);
      } else {
        toast.success(`Assigned jury for ${round} updated for ${res.team_name}`);
      }
      loadAllData();
    }
  };

  const handleResetTeamEvaluation = async (team: OrehackTeam) => {
    if (
      confirm(
        `Reset evaluation scores for Team "${team.team_name}"? All submitted scores for this team will be reset to 0, returning status to Pending.`
      )
    ) {
      await clearTeamEvaluationStatus(team.team_special_id);
      toast.success(`Evaluation reset for ${team.team_name}. Ready for re-evaluation.`);
      loadAllData();
    }
  };

  // ── JURY REGISTRATION ──
  const handleSaveJury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!juryForm.jury_id || !juryForm.name || !juryForm.phone) {
      toast.error("Please fill in Jury ID, Judge Name, and 10-digit Phone Number.");
      return;
    }

    const cleanPhone = (juryForm.phone || "").replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    await addOrUpdateJury({
      jury_id: juryForm.jury_id.trim(),
      name: juryForm.name.trim(),
      phone: cleanPhone,
      password: cleanPhone, // Complete 10 numbers
      panel_name: juryForm.panel_name || "General Panel",
    });

    setIsJuryModalOpen(false);
    toast.success("Jury member registered.");
    loadAllData();
  };

  const handleDeleteJury = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove Judge "${name}"?`)) {
      await deleteJury(id);
      toast.success(`Removed Judge "${name}".`);
      loadAllData();
    }
  };

  // ── CRITERIA-WISE SCORE EDITOR MODAL OPEN ──
  const openCriteriaScoreModal = (team: OrehackTeam) => {
    setSelectedTeamForScore(team);

    // Populate R1 (/35)
    setR1Understanding(team.r1_breakdown?.problem_understanding ?? (team.r1_score ? Math.min(5, team.r1_score * 0.15) : 0));
    setR1Functionality(team.r1_breakdown?.core_functionality ?? (team.r1_score ? Math.min(15, team.r1_score * 0.45) : 0));
    setR1Uiux(team.r1_breakdown?.ui_ux ?? (team.r1_score ? Math.min(10, team.r1_score * 0.25) : 0));
    setR1Innovation(team.r1_breakdown?.innovation ?? (team.r1_score ? Math.min(5, team.r1_score * 0.15) : 0));

    // Populate R2 (/50) + Tool (/30)
    setR2Understanding(team.r2_breakdown?.problem_understanding ?? (team.r2_jury_score ? Math.min(5, team.r2_jury_score * 0.1) : 0));
    setR2Functionality(team.r2_breakdown?.core_functionality ?? (team.r2_jury_score ? Math.min(20, team.r2_jury_score * 0.4) : 0));
    setR2Technical(team.r2_breakdown?.technical_implementation ?? (team.r2_jury_score ? Math.min(10, team.r2_jury_score * 0.2) : 0));
    setR2Uiux(team.r2_breakdown?.ui_ux ?? (team.r2_jury_score ? Math.min(10, team.r2_jury_score * 0.2) : 0));
    setR2Innovation(team.r2_breakdown?.innovation ?? (team.r2_jury_score ? Math.min(5, team.r2_jury_score * 0.1) : 0));
    setR2ToolScore(team.r2_tool_score ?? 0);

    // Populate Side Quest (/25)
    setSqImplementation(team.sidequest_breakdown?.correct_implementation ?? (team.sidequest_score ? Math.min(10, team.sidequest_score * 0.4) : 0));
    setSqIntegration(team.sidequest_breakdown?.integration ?? (team.sidequest_score ? Math.min(5, team.sidequest_score * 0.2) : 0));
    setSqTechnicalQuality(team.sidequest_breakdown?.technical_quality ?? (team.sidequest_score ? Math.min(2, team.sidequest_score * 0.1) : 0));
    setSqUiux(team.sidequest_breakdown?.ui_ux ?? (team.sidequest_score ? Math.min(5, team.sidequest_score * 0.2) : 0));
    setSqCreativity(team.sidequest_breakdown?.creativity ?? (team.sidequest_score ? Math.min(3, team.sidequest_score * 0.1) : 0));

    setIsCriteriaScoreModalOpen(true);
  };

  // Calculated totals for the modal
  const modalR1Total = Number((r1_understanding + r1_functionality + r1_uiux + r1_innovation).toFixed(2));
  const modalR2JuryTotal = Number((r2_understanding + r2_functionality + r2_technical + r2_uiux + r2_innovation).toFixed(2));
  const modalCalculated = calculateCombinedScores({
    r1: modalR1Total,
    r2_jury: modalR2JuryTotal,
    r2_tool: r2_tool_score,
    sidequest: sq_implementation + sq_integration + sq_technical_quality + sq_uiux + sq_creativity,
  });

  const handleSaveCriteriaScores = async () => {
    if (!selectedTeamForScore) return;

    const updatedTeam: OrehackTeam = {
      ...selectedTeamForScore,
      r1_score: modalCalculated.r1_score,
      r1_breakdown: {
        problem_understanding: r1_understanding,
        core_functionality: r1_functionality,
        ui_ux: r1_uiux,
        innovation: r1_innovation,
      },
      r2_jury_score: modalCalculated.r2_jury_score,
      r2_tool_score: modalCalculated.r2_tool_score,
      r2_score: modalCalculated.r2_score,
      r2_breakdown: {
        problem_understanding: r2_understanding,
        core_functionality: r2_functionality,
        technical_implementation: r2_technical,
        ui_ux: r2_uiux,
        innovation: r2_innovation,
      },
      sidequest_score: modalCalculated.sidequest_score,
      sidequest_breakdown: {
        correct_implementation: sq_implementation,
        integration: sq_integration,
        technical_quality: sq_technical_quality,
        ui_ux: sq_uiux,
        creativity: sq_creativity,
      },
      total_score: modalCalculated.total_score,
    };

    await addOrUpdateTeam(updatedTeam);
    setIsCriteriaScoreModalOpen(false);
    toast.success(`Scores updated for ${selectedTeamForScore.team_name}: ${modalCalculated.total_score} / 110`);
    loadAllData();
  };

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.team_name.toLowerCase().includes(q) ||
      t.leader_name.toLowerCase().includes(q) ||
      t.team_special_id.toLowerCase().includes(q) ||
      (t.assigned_jury_name && t.assigned_jury_name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (repoFilter === "submitted") {
      return Boolean(t.repo_link && t.repo_link.trim().length > 0);
    }
    if (repoFilter === "pending") {
      return !t.repo_link || t.repo_link.trim().length === 0;
    }
    return true;
  });

  // ── IF NOT AUTHENTICATED: SHOW ADMIN LOGIN FORM ──
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#030206] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-[#7c3aed]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl bg-[#0f0e1a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] text-center relative overflow-hidden"
        >
          <div className="h-8 px-3 rounded-xl bg-white inline-flex items-center justify-center mb-6 shadow-sm">
            <img src="/CH OREHACK Monogram Logo.png" alt="OreHack" className="h-5 w-auto object-contain" />
          </div>

          <h2 className="text-2xl font-black text-white font-serif uppercase tracking-tight mb-1">
            CODE CLASH 2026
          </h2>
          <p className="text-xs text-purple-300 font-bold tracking-wider uppercase mb-1">
            ADMIN CONTROL DECK
          </p>
          <p className="text-xs text-zinc-400 mb-6">
            Authorized access only. Manage teams, jury panels, and evaluation rubrics.
          </p>

          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Admin Passkey
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] shadow-lg transition-all"
            >
              Access Control Deck →
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link to="/orehack" className="text-xs text-zinc-400 hover:text-white">
              ← Return to Participant Portal
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── AUTHENTICATED ADMIN VIEW ──
  return (
    <div className="min-h-screen w-full bg-[#030206] text-white flex flex-col font-sans selection:bg-[#7c3aed] pb-20">
      {/* ── Top Header Navigation ── */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 bg-[#0d0b16]/90 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <Link to="/orehack" className="flex items-center gap-2.5">
            <div className="h-8 px-2.5 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <img src="/CH OREHACK Monogram Logo.png" alt="OreHack" className="h-5 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">CODE CLASH 2026</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin Deck
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsPSModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Problem Statement</span>
          </button>

          <Link
            to="/orehack/leaderboard"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-200 hover:text-white transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard ↗</span>
          </Link>

          <Link
            to="/orehack/jury"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Jury Portal ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* ── Main Dashboard Container ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Event Orchestration & Master Switches ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Submissions Switch */}
          <div className="p-4 rounded-2xl bg-[#12101b] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                Team Submissions
              </span>
              <p className="text-base font-bold text-white mt-0.5">
                {settings.submissions_open ? "LIVE & OPEN" : "CLOSED"}
              </p>
            </div>
            <button
              onClick={() => handleToggleSetting("submissions_open")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                settings.submissions_open
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-red-500/20 text-red-300 border border-red-500/40"
              }`}
            >
              {settings.submissions_open ? "Close" : "Open"}
            </button>
          </div>

          {/* Jury Evaluation Switch */}
          <div className="p-4 rounded-2xl bg-[#12101b] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                Jury Evaluation
              </span>
              <p className="text-base font-bold text-white mt-0.5">
                {settings.jury_evaluation_open ? "ACTIVE" : "PAUSED"}
              </p>
            </div>
            <button
              onClick={() => handleToggleSetting("jury_evaluation_open")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                settings.jury_evaluation_open
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "bg-zinc-800 text-zinc-400 border border-white/10"
              }`}
            >
              {settings.jury_evaluation_open ? "Pause" : "Start"}
            </button>
          </div>

          {/* Active Round Selector (R1, R2, Side Quest) */}
          <div className="p-4 rounded-2xl bg-[#12101b] border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider mb-1">
              Active Evaluation Round
            </span>
            <div className="flex items-center gap-1">
              {(["Round 1", "Round 2", "Side Quest"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoundChange(r)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    settings.active_round === r
                      ? "bg-[#7c3aed] text-white shadow-sm"
                      : "bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {r === "Side Quest" ? "Side Quest" : r.replace("Round ", "R")}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Publication Switch */}
          <div className="p-4 rounded-2xl bg-[#12101b] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                Public Leaderboard
              </span>
              <p className="text-base font-bold text-white mt-0.5">
                {settings.leaderboard_published ? "PUBLISHED" : "STANDBY"}
              </p>
            </div>
            <button
              onClick={() => handleToggleSetting("leaderboard_published")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                settings.leaderboard_published
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                  : "bg-zinc-800 text-zinc-400 border border-white/10"
              }`}
            >
              {settings.leaderboard_published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {/* ── Common Problem Statement Banner ── */}
        <div className="p-4 rounded-2xl bg-[#100e1c] border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Official Common Challenge
              </span>
              <h3 className="text-sm font-bold text-white">
                {settings.common_problem_statement}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 max-w-3xl line-clamp-1">
              {settings.common_problem_description}
            </p>
          </div>
          <button
            onClick={() => setIsPSModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 transition-colors whitespace-nowrap"
          >
            Edit Common PS
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "teams"
                ? "bg-[#7c3aed] text-white shadow-md shadow-purple-900/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teams & Rubric Scores ({teams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("jury")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "jury"
                ? "bg-[#7c3aed] text-white shadow-md shadow-purple-900/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Jury Panels ({juryList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("evaluations")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === "evaluations"
                ? "bg-[#7c3aed] text-white shadow-md shadow-purple-900/30"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Live Audit Feed ({evaluations.length})</span>
          </button>
        </div>

        {/* ── TAB 1: TEAMS & SCORES MANAGEMENT ── */}
        {activeTab === "teams" && (
          <div className="space-y-4">
            {/* Toolbar: Search, Repo Filters, CSV Import, CSV Export */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0f0d19] p-3 rounded-2xl border border-white/10">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search team, leader, or special ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              {/* Repo Submission Status Filters */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/5 text-xs">
                <button
                  onClick={() => setRepoFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    repoFilter === "all" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({teams.length})
                </button>
                <button
                  onClick={() => setRepoFilter("submitted")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    repoFilter === "submitted" ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Submitted ({teams.filter((t) => t.repo_link).length})
                </button>
                <button
                  onClick={() => setRepoFilter("pending")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    repoFilter === "pending" ? "bg-amber-500/20 text-amber-300" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Pending ({teams.filter((t) => !t.repo_link).length})
                </button>
              </div>

              {/* Action Buttons: Auto Assign, Revoke, CSV Import, CSV Export, Register Team */}
              <div className="flex items-center flex-wrap gap-2">
                {/* Auto Assign Teams to Jury */}
                <button
                  onClick={handleOpenAutoAssignModal}
                  title="Configure and auto distribute teams across selected jury members per round"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 transition-colors shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Auto Assign Jury</span>
                </button>

                {/* Revoke Round Jury Assignments */}
                <button
                  onClick={handleRevokeAssignments}
                  title={`Revoke jury assignments for ${activeJuryRoundView}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Revoke ({activeJuryRoundView === "Round 1" ? "R1" : activeJuryRoundView === "Round 2" ? "R2" : "SQ"})</span>
                </button>

                {/* Revoke All Rounds Jury Assignments */}
                <button
                  onClick={handleRevokeAllRoundsAssignments}
                  title="Revoke all jury assignments across all rounds"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Revoke All</span>
                </button>

                {/* Extract Repos CSV (Exact user requirement) */}
                <button
                  onClick={handleExportReposCSV}
                  title="Extract CSV containing Team Name & GitHub Repository alone"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Extract Repos CSV</span>
                </button>

                {/* Full Report Export */}
                <button
                  onClick={handleExportFullRosterCSV}
                  title="Export complete tournament score sheet"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Scores</span>
                </button>

                {/* Import Teams CSV */}
                <button
                  onClick={() => setIsCSVModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Teams (CSV)</span>
                </button>

                {/* Import OreHack Tool Evaluation CSV */}
                <button
                  onClick={() => {
                    setToolScoreCSVText("");
                    setParsedToolScores([]);
                    setIsToolScoreModalOpen(true);
                  }}
                  title="Upload OreHack Automated Evaluation CSV (30% weight for Round 2)"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 transition-colors shadow-sm"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Import Tool Scores (CSV)</span>
                </button>

                {/* Register Single Team */}
                <button
                  onClick={() => {
                    setTeamForm({
                      team_name: "",
                      leader_name: "",
                      phone: "",
                      password: "",
                      is_approved: true,
                      assigned_jury_id: "",
                    });
                    setIsTeamModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team</span>
                </button>

                {/* Delete All Teams (Password Protected: OREHACKOK) */}
                <button
                  onClick={handleOpenDeleteAllModal}
                  title="Remove all registered teams completely (requires confirmation passkey: OREHACKOK)"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Teams</span>
                </button>
              </div>
            </div>

            {/* Teams Roster Table */}
            <div className="rounded-2xl border border-white/10 bg-[#12101b] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-zinc-400 uppercase font-bold text-[11px] border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4">Team & Special ID</th>
                      <th className="py-3.5 px-4">Leader & Phone (Pass)</th>
                      <th className="py-3.5 px-4 min-w-[210px]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span>Assigned Jury</span>
                            <span className="text-[10px] text-purple-300 font-mono font-normal">
                              ({activeJuryRoundView})
                            </span>
                          </div>
                          <div className="inline-flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setActiveJuryRoundView("Round 1")}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${
                                activeJuryRoundView === "Round 1"
                                  ? "bg-[#7c3aed] text-white shadow-xs"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              R1
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveJuryRoundView("Round 2")}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${
                                activeJuryRoundView === "Round 2"
                                  ? "bg-[#7c3aed] text-white shadow-xs"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              R2
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveJuryRoundView("Side Quest")}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${
                                activeJuryRoundView === "Side Quest"
                                  ? "bg-[#7c3aed] text-white shadow-xs"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              Side Quest
                            </button>
                          </div>
                        </div>
                      </th>
                      <th className="py-3.5 px-4 text-center">R1 (/35)</th>
                      <th className="py-3.5 px-4 text-center">R2 (/50)</th>
                      <th className="py-3.5 px-4 text-center">Side Quest (/25)</th>
                      <th className="py-3.5 px-4 text-center">Total (/110)</th>
                      <th className="py-3.5 px-4 text-center">GitHub Repository</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-zinc-400">
                          <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                          <p className="font-semibold text-white">No teams found</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Click <strong>"Import Teams (CSV)"</strong> to bulk upload registered teams.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((team) => (
                        <tr key={team.team_special_id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Team & ID */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white text-sm block">{team.team_name}</span>
                            <span className="font-mono text-[11px] text-purple-400">{team.team_special_id}</span>
                          </td>

                          {/* Leader & Phone */}
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-zinc-200 block">{team.leader_name}</span>
                            <span className="font-mono text-[11px] text-zinc-400">
                              📞 {team.phone || team.password || "N/A"}
                            </span>
                          </td>

                          {/* Assigned Jury with Round-Specific Inline Reassignment Dropdown */}
                          <td className="py-3.5 px-4">
                            {(() => {
                              let currentJuryId = "";
                              if (activeJuryRoundView === "Round 1") {
                                currentJuryId =
                                  team.assigned_jury_r1_id !== undefined
                                    ? team.assigned_jury_r1_id || ""
                                    : team.assigned_jury_id || "";
                              } else if (activeJuryRoundView === "Round 2") {
                                currentJuryId = team.assigned_jury_r2_id || "";
                              } else if (activeJuryRoundView === "Side Quest") {
                                currentJuryId = team.assigned_jury_sidequest_id || "";
                              }

                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={currentJuryId}
                                      onChange={(e) =>
                                        handleInlineJuryChange(team.team_special_id, e.target.value, activeJuryRoundView)
                                      }
                                      className={`border rounded-lg px-2.5 py-1 text-xs focus:outline-none font-medium max-w-[170px] truncate transition-colors ${
                                        currentJuryId
                                          ? "bg-[#191726] border-purple-500/40 text-purple-200"
                                          : "bg-black/50 border-white/10 text-zinc-500 italic"
                                      }`}
                                    >
                                      <option value="">Unassigned</option>
                                      {juryList.map((j) => (
                                        <option key={j.jury_id} value={j.jury_id}>
                                          {j.name} ({j.panel_name || j.jury_id})
                                        </option>
                                      ))}
                                    </select>

                                    {currentJuryId && (
                                      <button
                                        type="button"
                                        onClick={() => handleInlineJuryChange(team.team_special_id, "", activeJuryRoundView)}
                                        title={`Unassign team from ${activeJuryRoundView}`}
                                        className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        <UserX className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Round breakdown mini pills */}
                                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                                    <span
                                      title={`Round 1: ${team.assigned_jury_r1_name || "Unassigned"}`}
                                      className={team.assigned_jury_r1_id ? "text-purple-400 font-medium" : "text-zinc-600"}
                                    >
                                      R1: {team.assigned_jury_r1_id ? team.assigned_jury_r1_name?.slice(0, 7) : "—"}
                                    </span>
                                    <span>•</span>
                                    <span
                                      title={`Round 2: ${team.assigned_jury_r2_name || "Unassigned"}`}
                                      className={team.assigned_jury_r2_id ? "text-indigo-400 font-medium" : "text-zinc-600"}
                                    >
                                      R2: {team.assigned_jury_r2_id ? team.assigned_jury_r2_name?.slice(0, 7) : "—"}
                                    </span>
                                    <span>•</span>
                                    <span
                                      title={`Side Quest: ${team.assigned_jury_sidequest_name || "Unassigned"}`}
                                      className={team.assigned_jury_sidequest_id ? "text-emerald-400 font-medium" : "text-zinc-600"}
                                    >
                                      SQ: {team.assigned_jury_sidequest_id ? team.assigned_jury_sidequest_name?.slice(0, 7) : "—"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          {/* R1 Score */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-200">
                            {team.r1_score?.toFixed(1) ?? "0.0"}
                          </td>

                          {/* R2 Score (Jury + 30% Tool Contribution) */}
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className="font-bold text-purple-300 block">{team.r2_score?.toFixed(1) ?? "0.0"}</span>
                            {team.r2_tool_score ? (
                              <button
                                type="button"
                                onClick={() => handleOpenToolAuditModal(team)}
                                title="Click to view full OreHack tool evaluation breakdown & AI reasoning"
                                className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/30 border border-indigo-500/30 text-[10px] text-indigo-300 font-sans font-semibold transition-colors cursor-pointer"
                              >
                                <Cpu className="w-2.5 h-2.5 text-indigo-400" />
                                <span>Tool: {team.r2_tool_score.toFixed(1)}/30 (+{((team.r2_tool_score / 30) * 15).toFixed(1)} pts)</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-sans block">
                                {team.r2_jury_score ? `Jury: ${team.r2_jury_score.toFixed(1)}` : "Pending"}
                              </span>
                            )}
                          </td>

                          {/* Side Quest Score */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-200">
                            {team.sidequest_score?.toFixed(1) ?? "0.0"}
                          </td>

                          {/* Grand Total */}
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 font-black text-sm border border-purple-500/30">
                              {team.total_score?.toFixed(2) ?? "0.00"}
                            </span>
                          </td>

                          {/* GitHub Repo */}
                          <td className="py-3.5 px-4 text-center">
                            {team.repo_link ? (
                              <a
                                href={team.repo_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium hover:bg-emerald-500/20 transition-colors"
                              >
                                <GitBranch className="w-3 h-3" />
                                <span>Submitted</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono italic">Pending</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Reset / Clear Evaluation Status */}
                              <button
                                onClick={() => handleResetTeamEvaluation(team)}
                                title="Reset / Clear Evaluation Status (scores back to 0)"
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Open Criteria Score Editor */}
                              <button
                                onClick={() => openCriteriaScoreModal(team)}
                                title="Edit Criteria-Wise Marks"
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Team */}
                              <button
                                onClick={() => {
                                  setTeamForm(team);
                                  setIsTeamModalOpen(true);
                                }}
                                title="Edit Team Data"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Team */}
                              <button
                                onClick={() => handleDeleteTeam(team.team_special_id, team.team_name)}
                                title="Delete Team"
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: JURY MANAGEMENT ── */}
        {activeTab === "jury" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Jury Panel Roster</h3>
                <p className="text-xs text-zinc-400">
                  Judges sign in using their registered 10-digit phone number as password.
                </p>
              </div>

              <button
                onClick={() => {
                  setJuryForm({
                    jury_id: `JURY-${String(juryList.length + 1).padStart(2, "0")}`,
                    name: "",
                    phone: "",
                    password: "",
                    panel_name: "Panel A - Autonomous Systems",
                  });
                  setIsJuryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Judge</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {juryList.map((judge) => {
                const assignedTeams = teams.filter((t) => t.assigned_jury_id === judge.jury_id);
                return (
                  <div key={judge.jury_id} className="p-5 rounded-2xl bg-[#12101b] border border-white/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                          {judge.jury_id}
                        </span>
                        <h4 className="font-bold text-white text-base mt-1.5">{judge.name}</h4>
                        <p className="text-xs text-zinc-400">{judge.panel_name}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteJury(judge.jury_id, judge.name)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Phone (Password):</span>
                        <span className="font-mono text-zinc-300 font-bold">{judge.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Assigned Teams:</span>
                        <span className="font-mono text-purple-300 font-bold">{assignedTeams.length} teams</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 3: LIVE AUDIT FEED ── */}
        {activeTab === "evaluations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Evaluation Audit Log</h3>
                <p className="text-xs text-zinc-400">
                  Scores and feedback entered by jury members across rounds.
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300"
              >
                Refresh Log
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#12101b] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-zinc-400 uppercase font-bold text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Judge</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4 text-center">Score Awarded</th>
                    <th className="py-3 px-4">Feedback Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {evaluations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500">
                        No evaluations logged yet.
                      </td>
                    </tr>
                  ) : (
                    evaluations.map((ev, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                          {ev.updated_at ? new Date(ev.updated_at).toLocaleTimeString() : "Just now"}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{ev.team_name}</td>
                        <td className="py-3 px-4 text-purple-300">{ev.jury_name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-bold">
                            {ev.round}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                          {ev.raw_score}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                          {ev.feedback || <span className="text-zinc-600 italic">None</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL 1: CSV BULK IMPORT ── */}
      <AnimatePresence>
        {isCSVModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-3xl bg-[#13111f] border border-white/15 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-400" />
                    <span>Bulk Import Teams (CSV)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    CSV Columns: <strong>Team Name, Leader Name, Phone Number</strong>
                  </p>
                </div>
                <button
                  onClick={() => setIsCSVModalOpen(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Sample Template Download */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <span className="text-xs text-purple-200">
                  Need the exact CSV format?
                </span>
                <button
                  onClick={handleDownloadSampleCSV}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* File Upload Drop Area */}
              <div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={fileInputRef}
                  onChange={handleCSVFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-8 h-8 text-purple-400" />
                  <span className="text-xs font-bold text-white">Click to Select CSV File from Device</span>
                  <span className="text-[11px] text-zinc-500">Supports .csv files</span>
                </button>
              </div>

              {/* Or paste CSV content */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Or Paste Raw CSV Data Directly:
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    const parsed = parseTeamsCSV(e.target.value, settings.common_problem_statement);
                    setCsvPreviewCount(parsed.length);
                  }}
                  rows={5}
                  placeholder={`Team Name,Leader Name,Phone Number\nAlpha Innovators,Aarav Patel,9876543210\nRoboCraft,Diya Sharma,9812345678`}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              {csvPreviewCount !== null && (
                <p className="text-xs text-emerald-400 font-semibold">
                  ✓ Detected {csvPreviewCount} valid team records ready for import.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCSVModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCSVImport}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-md transition-all"
                >
                  Import Teams
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: CRITERIA-WISE SCORE EDITOR ── */}
      <AnimatePresence>
        {isCriteriaScoreModalOpen && selectedTeamForScore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 rounded-3xl bg-[#141222] border border-purple-500/30 shadow-2xl space-y-5 my-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400 font-bold">
                      {selectedTeamForScore.team_special_id}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-xs text-zinc-300">Leader: {selectedTeamForScore.leader_name}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selectedTeamForScore.team_name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCriteriaScoreModalOpen(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Round Score Navigation Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveScoreTab("r1")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeScoreTab === "r1"
                      ? "bg-[#7c3aed] text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Round 1 ({modalR1Total} / 35)
                </button>
                <button
                  onClick={() => setActiveScoreTab("r2")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeScoreTab === "r2"
                      ? "bg-[#7c3aed] text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Round 2 ({modalCalculated.r2_score} / 50)
                </button>
                <button
                  onClick={() => setActiveScoreTab("sidequest")}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeScoreTab === "sidequest"
                      ? "bg-[#7c3aed] text-white shadow"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Side Quest ({modalCalculated.sidequest_score} / 25)
                </button>
              </div>

              {/* TAB 1: ROUND 1 RUBRICS (/35) */}
              {activeScoreTab === "r1" && (
                <div className="space-y-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase text-purple-300">
                      Round 1: Initial Development Rubrics
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      Subtotal: {modalR1Total} / 35
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Problem Understanding (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{r1_understanding}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={r1_understanding}
                      onChange={(e) => setR1Understanding(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Core Functionality (Max 15)</span>
                      <span className="font-mono font-bold text-purple-300">{r1_functionality}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={0.5}
                      value={r1_functionality}
                      onChange={(e) => setR1Functionality(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">UI/UX Design & User Experience (Max 10)</span>
                      <span className="font-mono font-bold text-purple-300">{r1_uiux}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={r1_uiux}
                      onChange={(e) => setR1Uiux(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Innovation (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{r1_innovation}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={r1_innovation}
                      onChange={(e) => setR1Innovation(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ROUND 2 RUBRICS (/50) + TOOL SCORE (/30) */}
              {activeScoreTab === "r2" && (
                <div className="space-y-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div>
                      <span className="text-xs font-bold uppercase text-purple-300 block">
                        Round 2: Advanced Coordination & Tool Integration
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        70% Jury ({modalR2JuryTotal}/50) + 30% Automated Tool ({r2_tool_score}/30)
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">
                      R2 Effective: {modalCalculated.r2_score} / 50
                    </span>
                  </div>

                  {/* 5 Jury Criteria */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Problem Understanding (Max 5)</span>
                        <span className="font-mono font-bold text-purple-300">{r2_understanding}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={r2_understanding}
                        onChange={(e) => setR2Understanding(parseFloat(e.target.value))}
                        className="w-full accent-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Core Functionality (Max 20)</span>
                        <span className="font-mono font-bold text-purple-300">{r2_functionality}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.5}
                        value={r2_functionality}
                        onChange={(e) => setR2Functionality(parseFloat(e.target.value))}
                        className="w-full accent-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Technical Implementation (Max 10)</span>
                        <span className="font-mono font-bold text-purple-300">{r2_technical}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={r2_technical}
                        onChange={(e) => setR2Technical(parseFloat(e.target.value))}
                        className="w-full accent-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">UI/UX Design & User Experience (Max 10)</span>
                        <span className="font-mono font-bold text-purple-300">{r2_uiux}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={r2_uiux}
                        onChange={(e) => setR2Uiux(parseFloat(e.target.value))}
                        className="w-full accent-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300">Innovation (Max 5)</span>
                        <span className="font-mono font-bold text-purple-300">{r2_innovation}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={r2_innovation}
                        onChange={(e) => setR2Innovation(parseFloat(e.target.value))}
                        className="w-full accent-[#7c3aed]"
                      />
                    </div>
                  </div>

                  {/* Automated Tool Score (Runs in R2 alone) */}
                  <div className="p-3.5 rounded-xl bg-purple-900/20 border border-purple-500/30">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-purple-200 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        Automated Tool Evaluation (30% weight in R2)
                      </span>
                      <span className="font-mono font-bold text-indigo-300">
                        {r2_tool_score} / 30 marks
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={0.5}
                      value={r2_tool_score}
                      onChange={(e) => setR2ToolScore(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Tool runs exclusively in Round 2. Weighted into the R2 total as 30% ({((r2_tool_score / 30) * 15).toFixed(1)} / 15 marks).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: SIDE QUEST RUBRICS (/25) */}
              {activeScoreTab === "sidequest" && (
                <div className="space-y-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold uppercase text-purple-300">
                      Side Quest: Predictive Risk Intelligence
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      Subtotal: {modalCalculated.sidequest_score} / 25
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Correct Implementation (Max 10)</span>
                      <span className="font-mono font-bold text-purple-300">{sq_implementation}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={sq_implementation}
                      onChange={(e) => setSqImplementation(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Integration with Existing App (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{sq_integration}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={sq_integration}
                      onChange={(e) => setSqIntegration(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Technical Quality (Max 2)</span>
                      <span className="font-mono font-bold text-purple-300">{sq_technical_quality}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.25}
                      value={sq_technical_quality}
                      onChange={(e) => setSqTechnicalQuality(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">UI/UX (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{sq_uiux}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={sq_uiux}
                      onChange={(e) => setSqUiux(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Creativity (Max 3)</span>
                      <span className="font-mono font-bold text-purple-300">{sq_creativity}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.25}
                      value={sq_creativity}
                      onChange={(e) => setSqCreativity(parseFloat(e.target.value))}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}

              {/* Combined Grand Total Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-black/80 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-purple-300 tracking-wider">
                    Calculated Grand Total
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    R1 ({modalCalculated.r1_score}) + R2 ({modalCalculated.r2_score}) + Side Quest ({modalCalculated.sidequest_score})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white font-mono">
                    {modalCalculated.total_score}
                  </span>
                  <span className="text-xs text-zinc-400"> / 110 marks</span>
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!selectedTeamForScore) return;
                    if (
                      confirm(
                        `Reset all evaluation scores for Team "${selectedTeamForScore.team_name}" back to 0? Status will revert to Pending.`
                      )
                    ) {
                      await clearTeamEvaluationStatus(selectedTeamForScore.team_special_id);
                      setIsCriteriaScoreModalOpen(false);
                      toast.success(`Evaluation scores cleared for ${selectedTeamForScore.team_name}`);
                      loadAllData();
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset / Clear Evaluation</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCriteriaScoreModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCriteriaScores}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg transition-all"
                  >
                    Save & Sync to Leaderboard
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 3: SINGLE TEAM REGISTER/EDIT ── */}
      <AnimatePresence>
        {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-[#13111f] border border-white/15 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white">
                  {teamForm.team_special_id ? "Edit Team" : "Register Single Team"}
                </h3>
                <button onClick={() => setIsTeamModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTeam} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.team_name || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
                    placeholder="e.g. CodeWarriors"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Team Leader Name *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.leader_name || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, leader_name: e.target.value })}
                    placeholder="e.g. Diya Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Leader Phone Number (10 digits - Also acts as Login Password) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={teamForm.phone || teamForm.password || ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setTeamForm({ ...teamForm, phone: digits, password: digits });
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    The participant will use this 10-digit number to log in.
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
                  <span className="text-[11px] uppercase font-bold text-purple-300 block">
                    Round-Wise Jury Panels
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1">Round 1 Jury</label>
                      <select
                        value={teamForm.assigned_jury_r1_id || teamForm.assigned_jury_id || ""}
                        onChange={(e) => setTeamForm({ ...teamForm, assigned_jury_r1_id: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#7c3aed]"
                      >
                        <option value="">Unassigned</option>
                        {juryList.map((j) => (
                          <option key={j.jury_id} value={j.jury_id}>
                            {j.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1">Round 2 Jury</label>
                      <select
                        value={teamForm.assigned_jury_r2_id || ""}
                        onChange={(e) => setTeamForm({ ...teamForm, assigned_jury_r2_id: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#7c3aed]"
                      >
                        <option value="">Unassigned</option>
                        {juryList.map((j) => (
                          <option key={j.jury_id} value={j.jury_id}>
                            {j.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1">Side Quest Jury</label>
                      <select
                        value={teamForm.assigned_jury_sidequest_id || ""}
                        onChange={(e) => setTeamForm({ ...teamForm, assigned_jury_sidequest_id: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#7c3aed]"
                      >
                        <option value="">Unassigned</option>
                        {juryList.map((j) => (
                          <option key={j.jury_id} value={j.jury_id}>
                            {j.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">GitHub Repo URL (Optional)</label>
                  <input
                    type="url"
                    value={teamForm.repo_link || ""}
                    onChange={(e) => setTeamForm({ ...teamForm, repo_link: e.target.value })}
                    placeholder="https://github.com/org/repo"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow"
                  >
                    Save Team
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 4: JURY REGISTRATION ── */}
      <AnimatePresence>
        {isJuryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#13111f] border border-white/15 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white">Add Jury Member</h3>
                <button onClick={() => setIsJuryModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveJury} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Jury ID *</label>
                  <input
                    type="text"
                    required
                    value={juryForm.jury_id || ""}
                    onChange={(e) => setJuryForm({ ...juryForm, jury_id: e.target.value })}
                    placeholder="e.g. JURY-01"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Judge Name *</label>
                  <input
                    type="text"
                    required
                    value={juryForm.name || ""}
                    onChange={(e) => setJuryForm({ ...juryForm, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">
                    Phone Number (10 digits - Also acts as Login Password) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={juryForm.phone || ""}
                    onChange={(e) => setJuryForm({ ...juryForm, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Judge will use this 10-digit number to log in.
                  </span>
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Panel Name</label>
                  <input
                    type="text"
                    value={juryForm.panel_name || ""}
                    onChange={(e) => setJuryForm({ ...juryForm, panel_name: e.target.value })}
                    placeholder="e.g. Panel A - Autonomous Systems"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJuryModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow"
                  >
                    Save Judge
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: COMMON PROBLEM STATEMENT EDITOR ── */}
      <AnimatePresence>
        {isPSModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-3xl bg-[#13111f] border border-white/15 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>Configure Common Problem Statement</span>
                </h3>
                <button onClick={() => setIsPSModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCommonPS} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Challenge Title *</label>
                  <input
                    type="text"
                    required
                    value={psTitle}
                    onChange={(e) => setPsTitle(e.target.value)}
                    placeholder="e.g. Emergency Response & Disaster Management Platform"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-bold focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-bold block mb-1">Challenge Description</label>
                  <textarea
                    rows={4}
                    value={psDescription}
                    onChange={(e) => setPsDescription(e.target.value)}
                    placeholder="Enter full problem statement details..."
                    className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPSModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow"
                  >
                    Save & Update All Teams
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 6: PURGE / DELETE ALL TEAMS CONFIRMATION (PASSKEY: OREHACKOK) ── */}
      <AnimatePresence>
        {isDeleteAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#130d14] border border-red-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.15)] space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    Delete All Registered Teams
                  </h3>
                  <p className="text-xs text-red-300 font-medium">Irreversible Destruction Warning</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-xs text-zinc-300 leading-relaxed">
                This will <strong className="text-red-300">permanently erase all teams</strong>, their repository links, and their evaluation marks across all rounds from the database.
              </div>

              {deleteAllError && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-200">
                  {deleteAllError}
                </div>
              )}

              <form onSubmit={handleConfirmDeleteAllTeams} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1.5 uppercase tracking-wider text-[11px]">
                    Enter Confirmation Passkey to Proceed:
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={deleteAllPasskey}
                    onChange={(e) => {
                      setDeleteAllPasskey(e.target.value);
                      if (deleteAllError) setDeleteAllError("");
                    }}
                    placeholder="Enter OREHACKOK"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-red-500/30 text-white font-mono font-bold tracking-widest text-center focus:outline-none focus:border-red-400 placeholder:text-zinc-600"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block text-center">
                    Type <code className="text-red-300 font-bold bg-white/5 px-1 py-0.5 rounded font-mono">OREHACKOK</code> exactly as shown.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    disabled={isDeletingAll}
                    onClick={() => {
                      setIsDeleteAllModalOpen(false);
                      setDeleteAllPasskey("");
                      setDeleteAllError("");
                    }}
                    className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeletingAll || !deleteAllPasskey.trim()}
                    className="px-5 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDeletingAll ? "Deleting..." : "Permanently Delete All Teams"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 7: AUTO ASSIGN JURY (ROUND-WISE, SELECT JURYS, CAPACITIES) ── */}
      <AnimatePresence>
        {isAutoAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-[#13111f] border border-purple-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(124,58,237,0.2)] space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      Auto Assign Teams to Jury
                    </h3>
                    <p className="text-xs text-purple-300">
                      Configure round, select present judges, and set team quotas.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAutoAssignModalOpen(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Target Round */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                  1. Target Competition Stage
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Round 1", "Round 2", "Side Quest", "all"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAutoAssignRound(r)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        autoAssignRound === r
                          ? "bg-[#7c3aed] text-white shadow-md shadow-purple-900/30 border border-purple-400/30"
                          : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {r === "all" ? "All Rounds" : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Present Judges */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider">
                    2. Select Present Judges ({autoAssignSelectedJuryIds.length} / {juryList.length})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoAssignSelectedJuryIds(juryList.map((j) => j.jury_id))}
                      className="text-[11px] text-purple-300 hover:text-white underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoAssignSelectedJuryIds([])}
                      className="text-[11px] text-zinc-500 hover:text-white underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-2xl bg-black/50 border border-white/10 p-2 space-y-1 divide-y divide-white/5">
                  {juryList.map((judge) => {
                    const isSelected = autoAssignSelectedJuryIds.includes(judge.jury_id);
                    // Count how many teams currently assigned for this round
                    const count = teams.filter((t) => {
                      if (autoAssignRound === "Round 1") {
                        return (t.assigned_jury_r1_id || t.assigned_jury_id) === judge.jury_id;
                      }
                      if (autoAssignRound === "Round 2") {
                        return t.assigned_jury_r2_id === judge.jury_id;
                      }
                      if (autoAssignRound === "Side Quest") {
                        return t.assigned_jury_sidequest_id === judge.jury_id;
                      }
                      return t.assigned_jury_id === judge.jury_id;
                    }).length;

                    return (
                      <label
                        key={judge.jury_id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAutoAssignSelectedJuryIds([...autoAssignSelectedJuryIds, judge.jury_id]);
                              } else {
                                setAutoAssignSelectedJuryIds(
                                  autoAssignSelectedJuryIds.filter((id) => id !== judge.jury_id)
                                );
                              }
                            }}
                            className="rounded accent-[#7c3aed]"
                          />
                          <div>
                            <span className="font-semibold text-white block">{judge.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {judge.panel_name || judge.jury_id}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          {count} teams
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Quota / Teams per Judge */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-zinc-300 uppercase tracking-wider">
                    3. Max Teams Each Present Judge Should Take
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const count = autoAssignSelectedJuryIds.length || 1;
                      setAutoAssignTeamsPerJury(Math.ceil(teams.length / count));
                    }}
                    className="text-[11px] text-purple-300 hover:text-white underline"
                  >
                    Evenly Divide ({Math.ceil(teams.length / (autoAssignSelectedJuryIds.length || 1))}/judge)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={teams.length || 60}
                    value={autoAssignTeamsPerJury}
                    onChange={(e) => setAutoAssignTeamsPerJury(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#7c3aed]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-medium">
                    teams / judge
                  </span>
                </div>

                {/* Live Distribution Summary Card */}
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Projected Coverage</span>
                    <span className="font-bold text-white">
                      {Math.min(teams.length, autoAssignTeamsPerJury * autoAssignSelectedJuryIds.length)} / {teams.length} Teams
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Active Judges</span>
                    <span className="font-bold text-purple-300 font-mono">
                      {autoAssignSelectedJuryIds.length} judges ({autoAssignTeamsPerJury} max each)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAutoAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={autoAssignSelectedJuryIds.length === 0 || teams.length === 0}
                  onClick={handleExecuteAutoAssign}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Assign Teams for {autoAssignRound}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 8: IMPORT OREHACK TOOL EVALUATIONS (CSV / TSV) ── */}
      <AnimatePresence>
        {isToolScoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 rounded-3xl bg-[#12101e] border border-indigo-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(99,102,241,0.2)] space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">
                      Import OreHack Tool Evaluations
                    </h3>
                    <p className="text-xs text-indigo-300">
                      Scores automatically contribute 30% marks (up to 15 marks) for Round 2.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsToolScoreModalOpen(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Supported Columns Guide */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                  Expected CSV / TSV Columns:
                </span>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {[
                    "Team_Name",
                    "Problem_Statement",
                    "Repo_URL",
                    "Progress",
                    "Total_Scores",
                    "Tech_Scores",
                    "Innov_Scores",
                    "Completeness_Scores",
                    "Reasoning",
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload or Paste Controls */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={toolScoreFileInputRef}
                  onChange={handleToolScoreFileUpload}
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => toolScoreFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-200 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Evaluation CSV/TSV File</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSampleToolCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Format</span>
                </button>
              </div>

              {/* Raw CSV Textarea */}
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Or Paste CSV / Tab-Separated Output:
                </label>
                <textarea
                  rows={5}
                  value={toolScoreCSVText}
                  onChange={(e) => handleToolScoreTextChange(e.target.value)}
                  placeholder={`Team_Name\tProblem_Statement\tRepo_URL\tProgress\tTotal_Scores\tTech_Scores\tInnov_Scores\tCompleteness_Scores\tReasoning\nAlpha Innovators\tEmergency Response\thttps://github.com/...\t100%\t26.5\t9.0\t8.5\t9.0\tWell-structured code...`}
                  className="w-full p-3 rounded-2xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Parsed Preview Table with Strict Verification Indicator */}
              {parsedToolScores.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      Strict Verification Preview ({parsedToolScores.length} rows detected)
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Rule: Both Team Name & Repo Link MUST match
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-2xl bg-black/50 border border-white/10 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-zinc-400 uppercase font-mono text-[10px] border-b border-white/10">
                        <tr>
                          <th className="py-2.5 px-3">Team Name & Repo Verification</th>
                          <th className="py-2.5 px-3 text-center">Progress</th>
                          <th className="py-2.5 px-3 text-center">Raw Score</th>
                          <th className="py-2.5 px-3 text-center">R2 Contribution (30%)</th>
                          <th className="py-2.5 px-3">Match Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {parsedToolScores.map((score, i) => {
                          const val = validateToolScoreMatch(score, teams);

                          return (
                            <tr key={i} className="hover:bg-white/[0.02]">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-white block">{score.team_name}</span>
                                <span className="text-[10px] font-mono text-zinc-400 block truncate max-w-[200px]" title={score.repo_url}>
                                  CSV Repo: {score.repo_url || "None"}
                                </span>
                                {val.team && (
                                  <span className="text-[10px] font-mono text-zinc-500 block truncate max-w-[200px]" title={val.team.repo_link}>
                                    Registered: {val.team.repo_link || "Pending Submission"}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-zinc-300">
                                {score.progress || "100%"}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-300">
                                {score.total_scores}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono">
                                <span className="font-bold text-emerald-300">
                                  +{((score.normalized_r2_tool / 30) * 15).toFixed(1)} pts
                                </span>
                                <span className="text-[9px] text-zinc-500 block">
                                  ({score.normalized_r2_tool.toFixed(1)}/30)
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {val.status === "verified" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium text-[10px]">
                                    ✓ Verified Match
                                  </span>
                                ) : val.status === "repo_mismatch" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-medium text-[10px]" title={val.message}>
                                    ✕ Repo Mismatch
                                  </span>
                                ) : val.status === "no_team_repo" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium text-[10px]" title={val.message}>
                                    ⚠ No Repo in Roster
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-500/15 border border-zinc-500/30 text-zinc-400 font-medium text-[10px]">
                                    ✕ Team Not Found
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary of verified vs rejected */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px]">
                    <span className="text-emerald-400 font-semibold">
                      ✓ Ready to Apply: {parsedToolScores.filter((s) => validateToolScoreMatch(s, teams).status === "verified").length} teams (Both Name & Repo verified)
                    </span>
                    <span className="text-red-400 font-semibold">
                      ✕ Rejected: {parsedToolScores.filter((s) => validateToolScoreMatch(s, teams).status !== "verified").length} entries
                    </span>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsToolScoreModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    parsedToolScores.filter((s) => validateToolScoreMatch(s, teams).status === "verified").length === 0
                  }
                  onClick={handleExecuteToolScoreImport}
                  className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Apply to {parsedToolScores.filter((s) => validateToolScoreMatch(s, teams).status === "verified").length} Verified Teams
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 9: OREHACK TOOL EVALUATION DETAILS AUDIT MODAL ── */}
      <AnimatePresence>
        {isToolAuditModalOpen && selectedTeamForToolAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-3xl bg-[#12101e] border border-indigo-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(99,102,241,0.2)] space-y-4"
            >
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedTeamForToolAudit.team_name} — OreHack Evaluation Audit
                    </h3>
                    <p className="text-xs text-indigo-300 font-mono">
                      {selectedTeamForToolAudit.team_special_id} • Round 2 30% Contribution
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsToolAuditModalOpen(false)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* R2 Score Contribution Header */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/60 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
                    Round 2 Automated Tool Contribution
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    +{((((selectedTeamForToolAudit.r2_tool_score || 0) / 30) * 15)).toFixed(1)} pts
                  </span>
                  <span className="text-xs text-zinc-400 font-medium"> / 15 max marks</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                    Normalized Tool Score
                  </span>
                  <span className="text-xl font-bold text-indigo-300 font-mono">
                    {selectedTeamForToolAudit.r2_tool_score?.toFixed(1) || "0.0"} / 30
                  </span>
                </div>
              </div>

              {/* Sub-Rubric Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Tech Score</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {selectedTeamForToolAudit.tool_evaluation?.tech_score ?? "—"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Innovation</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {selectedTeamForToolAudit.tool_evaluation?.innov_score ?? "—"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Completeness</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {selectedTeamForToolAudit.tool_evaluation?.completeness_score ?? "—"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase font-bold">Progress</span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                    {selectedTeamForToolAudit.tool_evaluation?.progress || "100%"}
                  </span>
                </div>
              </div>

              {/* Problem Statement & Evaluated Repo */}
              <div className="space-y-2 text-xs">
                {selectedTeamForToolAudit.repo_link && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-zinc-400 font-medium">Evaluated Repository:</span>
                    <a
                      href={selectedTeamForToolAudit.repo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:text-white inline-flex items-center gap-1 font-mono text-[11px] underline"
                    >
                      <GitBranch className="w-3 h-3" />
                      <span>{selectedTeamForToolAudit.repo_link}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {/* AI Reasoning / Feedback */}
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 font-mono block">
                    Automated Evaluation Reasoning & Feedback:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{selectedTeamForToolAudit.tool_evaluation?.reasoning ||
                      "Automated technical analysis completed for Round 2 code repository."}"
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsToolAuditModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Close Audit Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
