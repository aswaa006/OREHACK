import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProblemSelection, Problem } from "@/hooks/useControlState";

interface SelectionResultPanelProps {
  selections: ProblemSelection[];
  problems: Problem[];
  visible: boolean;
}

export const SelectionResultPanel: React.FC<SelectionResultPanelProps> = memo(
  ({ selections, problems, visible }) => {
    if (!visible) return null;

    const problemMap = new Map(problems.map((p) => [p.id, p]));

    return (
      <AnimatePresence>
        <motion.div
          key="result-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45 }}
          style={{
            borderRadius: 18,
            padding: "1.4rem 1.6rem",
            background: "rgba(15,12,28,0.82)",
            border: "1px solid rgba(168,85,247,0.28)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)",
            marginBottom: "2rem",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: "1.2rem",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#a855f7",
                boxShadow: "0 0 8px rgba(168,85,247,0.8)",
                flexShrink: 0,
              }}
            />
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(196,181,253,0.85)",
              }}
            >
              Selection Complete
            </h3>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              {selections.length} team{selections.length !== 1 ? "s" : ""} locked in
            </span>
          </div>

          {/* List */}
          {selections.length === 0 ? (
            <p
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.3)",
                textAlign: "center",
                padding: "1rem 0",
              }}
            >
              No selections recorded yet.
            </p>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {selections.map((sel, idx) => {
                const prob = problemMap.get(sel.problem_id);
                return (
                  <motion.li
                    key={`${sel.team_id}-${sel.problem_id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.38, delay: idx * 0.06 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "0.65rem 0.9rem",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Rank */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "rgba(196,181,253,0.55)",
                        minWidth: 22,
                      }}
                    >
                      #{idx + 1}
                    </span>

                    {/* Team name */}
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.85)",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {sel.team_name || sel.team_id}
                    </span>

                    {/* Arrow */}
                    <span style={{ color: "rgba(139,92,246,0.5)", fontSize: "0.7rem" }}>→</span>

                    {/* Problem label */}
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: "rgba(196,181,253,0.7)",
                        background: "rgba(168,85,247,0.1)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(168,85,247,0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {prob?.title ?? sel.problem_id}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);
SelectionResultPanel.displayName = "SelectionResultPanel";

export default SelectionResultPanel;
